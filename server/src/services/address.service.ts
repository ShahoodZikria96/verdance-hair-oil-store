import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

async function assertOwned(userId: string, id: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw ApiError.notFound('Address not found');
  return address;
}

export const addressService = {
  list(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async create(userId: string, input: Record<string, unknown> & { isDefault?: boolean }) {
    const count = await prisma.address.count({ where: { userId } });
    const makeDefault = input.isDefault || count === 0;
    return prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.create({
        data: { ...(input as object), userId, isDefault: makeDefault } as never,
      });
    });
  },

  async update(userId: string, id: string, input: Record<string, unknown> & { isDefault?: boolean }) {
    await assertOwned(userId, id);
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      return tx.address.update({ where: { id }, data: input as never });
    });
  },

  async remove(userId: string, id: string) {
    const address = await assertOwned(userId, id);
    await prisma.address.delete({ where: { id } });
    if (address.isDefault) {
      const next = await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
    return { id, deleted: true };
  },

  async setDefault(userId: string, id: string) {
    await assertOwned(userId, id);
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);
    return this.list(userId);
  },
};
