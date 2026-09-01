import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { buildPageMeta } from '../utils/pagination';

const publicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  _count: { select: { orders: true, reviews: true } },
} satisfies Prisma.UserSelect;

export const userService = {
  async list(query: { search?: string; page: number; limit: number }) {
    const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };
    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
      ];
    }
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: publicSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { customers: rows, meta: buildPageMeta(total, query.page, query.limit) };
  },

  async get(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { ...publicSelect, addresses: true },
    });
    if (!user) throw ApiError.notFound('Customer not found');
    return user;
  },

  async setActive(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw ApiError.notFound('Customer not found');
    if (user.role === 'ADMIN') throw ApiError.forbidden('Admin accounts cannot be modified here');
    await prisma.user.update({ where: { id }, data: { isActive } });
    if (!isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { id, isActive };
  },
};
