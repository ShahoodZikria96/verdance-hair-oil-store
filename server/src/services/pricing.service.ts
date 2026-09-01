import type { Coupon, Prisma } from '@prisma/client';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { D, money, toNumber } from '../utils/money';

export interface PriceableLine {
  quantity: number;
  unitPrice: Prisma.Decimal.Value;
}

/** Flat shipping rule: free over threshold, otherwise a standard fee (0 when empty). */
export function calcShipping(subtotal: Prisma.Decimal): Prisma.Decimal {
  if (subtotal.lte(0)) return money(0);
  return subtotal.gte(env.FREE_SHIPPING_THRESHOLD)
    ? money(0)
    : money(env.STANDARD_SHIPPING_FEE);
}

export function calcSubtotal(lines: PriceableLine[]): Prisma.Decimal {
  return lines.reduce<Prisma.Decimal>(
    (sum, l) => sum.add(new D(l.unitPrice).mul(l.quantity)),
    new D(0),
  );
}

/**
 * Server-authoritative coupon evaluation. Throws on any rule violation so the
 * frontend can never dictate a discount.
 */
export function calcCouponDiscount(coupon: Coupon, subtotal: Prisma.Decimal): Prisma.Decimal {
  const now = new Date();
  if (!coupon.isActive) throw ApiError.badRequest('This coupon is not active');
  if (coupon.startsAt && coupon.startsAt > now) throw ApiError.badRequest('This coupon is not active yet');
  if (coupon.expiresAt && coupon.expiresAt < now) throw ApiError.badRequest('This coupon has expired');
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }
  if (coupon.minimumOrderAmount && subtotal.lt(coupon.minimumOrderAmount)) {
    throw ApiError.badRequest(
      `Spend at least ${toNumber(coupon.minimumOrderAmount)} to use this coupon`,
    );
  }

  let discount =
    coupon.discountType === 'PERCENTAGE'
      ? subtotal.mul(coupon.discountValue).div(100)
      : new D(coupon.discountValue);

  if (coupon.maximumDiscount && discount.gt(coupon.maximumDiscount)) {
    discount = new D(coupon.maximumDiscount);
  }
  if (discount.gt(subtotal)) discount = subtotal;
  return money(discount);
}

export interface OrderTotals {
  subtotal: Prisma.Decimal;
  shippingFee: Prisma.Decimal;
  discount: Prisma.Decimal;
  total: Prisma.Decimal;
}

export function computeTotals(
  lines: PriceableLine[],
  coupon: Coupon | null,
): OrderTotals {
  const subtotal = money(calcSubtotal(lines));
  const discount = coupon ? calcCouponDiscount(coupon, subtotal) : money(0);
  const discountedSubtotal = money(subtotal.sub(discount));
  const shippingFee = calcShipping(discountedSubtotal);
  const total = money(discountedSubtotal.add(shippingFee));
  return { subtotal, shippingFee, discount, total };
}
