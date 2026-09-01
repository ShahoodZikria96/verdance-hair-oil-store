import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { D, money, toNumber } from '../utils/money';
import { calcCouponDiscount } from './pricing.service';

const serialise = (c: Awaited<ReturnType<typeof prisma.coupon.findFirstOrThrow>>) => ({
  id: c.id,
  code: c.code,
  description: c.description,
  discountType: c.discountType,
  discountValue: toNumber(c.discountValue)!,
  minimumOrderAmount: toNumber(c.minimumOrderAmount),
  maximumDiscount: toNumber(c.maximumDiscount),
  usageLimit: c.usageLimit,
  usedCount: c.usedCount,
  startsAt: c.startsAt,
  expiresAt: c.expiresAt,
  isActive: c.isActive,
  createdAt: c.createdAt,
});

export const couponService = {
  async findActiveByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw ApiError.notFound('Coupon not found');
    return coupon;
  },

  /** Public: check a code and preview the discount for a given subtotal. */
  async preview(code: string, subtotal: number) {
    const coupon = await this.findActiveByCode(code);
    const discount = calcCouponDiscount(coupon, money(subtotal));
    return {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: toNumber(coupon.discountValue)!,
      discount: toNumber(discount)!,
      newSubtotal: toNumber(money(new D(subtotal).sub(discount)))!,
    };
  },

  list() {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }).then((rows) => rows.map(serialise));
  },

  async create(input: Record<string, unknown>) {
    const c = await prisma.coupon.create({ data: input as never });
    return serialise(c);
  },

  async update(id: string, input: Record<string, unknown>) {
    const exists = await prisma.coupon.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Coupon not found');
    const c = await prisma.coupon.update({ where: { id }, data: input as never });
    return serialise(c);
  },

  async remove(id: string) {
    const exists = await prisma.coupon.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Coupon not found');
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    return { id, isActive: false };
  },
};
