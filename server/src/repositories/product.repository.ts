import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { productDetailInclude, productListInclude } from '../services/product.mapper';
import type { ProductListQuery } from '../validators/product.validators';

function buildWhere(q: ProductListQuery, opts: { publicOnly: boolean }): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  if (opts.publicOnly) and.push({ isActive: true });
  if (q.search) {
    and.push({
      OR: [
        { name: { contains: q.search } },
        { shortDescription: { contains: q.search } },
        { description: { contains: q.search } },
        { ingredients: { some: { ingredient: { name: { contains: q.search } } } } },
      ],
    });
  }
  if (q.category) and.push({ categories: { some: { category: { slug: q.category } } } });
  if (q.ingredient) and.push({ ingredients: { some: { ingredient: { slug: q.ingredient } } } });
  if (q.minPrice !== undefined) and.push({ price: { gte: q.minPrice } });
  if (q.maxPrice !== undefined) and.push({ price: { lte: q.maxPrice } });
  if (q.minRating !== undefined) and.push({ rating: { gte: q.minRating } });
  if (q.bestSeller !== undefined) and.push({ isBestSeller: q.bestSeller });
  if (q.featured !== undefined) and.push({ isFeatured: q.featured });
  return and.length ? { AND: and } : {};
}

function buildOrderBy(sort: ProductListQuery['sort']): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'price_asc':
      return [{ price: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }];
    case 'rating':
      return [{ rating: 'desc' }, { reviewCount: 'desc' }];
    case 'popularity':
    case 'best_selling':
      return [{ reviewCount: 'desc' }, { isBestSeller: 'desc' }];
    case 'featured':
    default:
      return [{ isBestSeller: 'desc' }, { isFeatured: 'desc' }, { createdAt: 'desc' }];
  }
}

export const productRepository = {
  async list(q: ProductListQuery, opts: { publicOnly: boolean }) {
    const where = buildWhere(q, opts);
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy: buildOrderBy(q.sort),
        skip,
        take: q.limit,
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },

  findBySlug(slug: string, opts: { publicOnly: boolean }) {
    return prisma.product.findFirst({
      where: opts.publicOnly ? { slug, isActive: true } : { slug },
      include: productDetailInclude,
    });
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: productDetailInclude });
  },

  bestSeller(opts: { publicOnly: boolean }) {
    return prisma.product.findFirst({
      where: { isBestSeller: true, ...(opts.publicOnly ? { isActive: true } : {}) },
      include: productDetailInclude,
      orderBy: [{ reviewCount: 'desc' }],
    });
  },

  featured(limit: number, opts: { publicOnly: boolean }) {
    return prisma.product.findMany({
      where: { isFeatured: true, ...(opts.publicOnly ? { isActive: true } : {}) },
      include: productListInclude,
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    });
  },

  related(slug: string, limit: number) {
    return prisma.product.findMany({
      where: { slug: { not: slug }, isActive: true },
      include: productListInclude,
      orderBy: [{ isBestSeller: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  },
};
