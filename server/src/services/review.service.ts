import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { buildPageMeta } from '../utils/pagination';
import { money } from '../utils/money';

type Tx = PrismaClient | Prisma.TransactionClient;

/** Recompute the denormalised rating + count from approved reviews. */
export async function recomputeProductRating(productId: string, tx: Tx = prisma) {
  const agg = await tx.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await tx.product.update({
    where: { id: productId },
    data: {
      rating: money(agg._avg.rating ?? 0),
      reviewCount: agg._count,
    },
  });
}

const mapReview = (r: {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  user?: { firstName: string; lastName: string } | null;
  product?: { name: string; slug: string } | null;
}) => ({
  id: r.id,
  productId: r.productId,
  product: r.product ? { name: r.product.name, slug: r.product.slug } : undefined,
  author: r.user ? `${r.user.firstName} ${r.user.lastName.charAt(0)}.` : 'Verdance customer',
  rating: r.rating,
  title: r.title,
  body: r.comment,
  verified: r.isVerified,
  approved: r.isApproved,
  date: r.createdAt.toISOString(),
});

export const reviewService = {
  async listForProduct(slug: string, page: number, limit: number) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) throw ApiError.notFound('Product not found');
    const where = { productId: product.id, isApproved: true };
    const [rows, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { reviews: rows.map(mapReview), meta: buildPageMeta(total, page, limit) };
  },

  async create(
    userId: string,
    slug: string,
    input: { rating: number; title?: string; comment: string },
  ) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) throw ApiError.notFound('Product not found');

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: product.id, userId } },
    });
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    // Verified only when the customer has actually ordered this product.
    const purchase = await prisma.orderItem.findFirst({
      where: { productId: product.id, order: { userId } },
      select: { orderId: true },
    });

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        orderId: purchase?.orderId ?? null,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: Boolean(purchase),
        isApproved: false, // pending moderation
      },
    });
    return mapReview(review);
  },

  listForUser(userId: string) {
    return prisma.review
      .findMany({
        where: { userId },
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) => rows.map(mapReview));
  },

  // ─── Admin moderation ────────────────────────────────────────────────

  async adminList(query: { approved?: 'true' | 'false'; page: number; limit: number }) {
    const where: Prisma.ReviewWhereInput = {};
    if (query.approved) where.isApproved = query.approved === 'true';
    const [rows, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { reviews: rows.map(mapReview), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async setApproval(id: string, approved: boolean) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');
    await prisma.$transaction(async (tx) => {
      await tx.review.update({ where: { id }, data: { isApproved: approved } });
      await recomputeProductRating(review.productId, tx);
    });
    return { id, isApproved: approved };
  },

  async remove(id: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw ApiError.notFound('Review not found');
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      await recomputeProductRating(review.productId, tx);
    });
    return { id, deleted: true };
  },
};
