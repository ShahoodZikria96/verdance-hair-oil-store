import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { mapProductCard, productListInclude } from './product.mapper';

export const wishlistService = {
  async list(userId: string) {
    const rows = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: productListInclude } },
    });
    return rows.map((r) => ({
      id: r.id,
      addedAt: r.createdAt.toISOString(),
      product: mapProductCard(r.product),
    }));
  },

  async add(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound('Product not found');
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
    return this.list(userId);
  },

  async remove(userId: string, productId: string) {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.list(userId);
  },
};
