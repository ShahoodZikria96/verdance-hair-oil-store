import type { Coupon, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { logger } from '../lib/logger';
import { money, toNumber } from '../utils/money';
import { buildPageMeta } from '../utils/pagination';
import { generateOrderNumber } from '../utils/orderNumber';
import { computeTotals } from './pricing.service';
import {
  codFee,
  codMaxOrder,
  getPaymentProviderForMethod,
  isCodEnabled,
} from './payment/PaymentService';
import { emailService } from './email/EmailService';
import { env } from '../config/env';
import { currencyService } from './currency.service';
import { mapOrder, orderInclude } from './order.mapper';
import type { createOrderSchema, orderListQuerySchema } from '../validators/order.validators';

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type OrderListQuery = z.infer<typeof orderListQuerySchema>;

interface AddressSnapshot {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

async function resolveShippingAddress(
  userId: string,
  input: CreateOrderInput,
): Promise<AddressSnapshot> {
  if (input.addressId) {
    const address = await prisma.address.findUnique({ where: { id: input.addressId } });
    if (!address || address.userId !== userId) throw ApiError.badRequest('Shipping address not found');
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };
  }
  const a = input.shippingAddress!;
  if (input.saveAddress) {
    const count = await prisma.address.count({ where: { userId } });
    await prisma.address.create({
      data: { ...a, userId, isDefault: count === 0 },
    });
  }
  return a;
}

const CANCELLABLE = new Set(['PENDING', 'CONFIRMED']);

export const orderService = {
  /**
   * `userId` is null for guest checkout — the browser sends its cart in
   * `input.items` and a `customerEmail`. Logged-in users use their server cart.
   * All money math runs in the store BASE currency, then the order is persisted
   * (and displayed) in `input.currency`.
   */
  async create(userId: string | null, input: CreateOrderInput) {
    let user: { email: string; phone: string | null } | null = null;
    let cartId: string | null = null;

    // 1–3 · resolve line items + validate stock, recalc prices from the DB
    let lines: {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }[];

    const priceLine = (product: {
      id: string;
      name: string;
      sku: string;
      isActive: boolean;
      stockQuantity: number;
      price: Prisma.Decimal;
    }, quantity: number) => {
      if (!product.isActive) throw ApiError.badRequest(`${product.name} is no longer available`);
      if (product.stockQuantity < quantity) {
        throw ApiError.badRequest(
          `Only ${product.stockQuantity} unit(s) of ${product.name} remain in stock`,
        );
      }
      const unitPrice = money(product.price);
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        totalPrice: money(unitPrice.mul(quantity)),
      };
    };

    if (userId) {
      const [dbUser, cart] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: userId } }),
        prisma.cart.findUnique({
          where: { userId },
          include: { items: { include: { product: true } } },
        }),
      ]);
      if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');
      user = dbUser;
      cartId = cart.id;
      lines = cart.items.map((item) => priceLine(item.product, item.quantity));
    } else {
      if (!input.items || input.items.length === 0) throw ApiError.badRequest('Your cart is empty');
      if (!input.customerEmail) {
        throw ApiError.badRequest('An email address is required to check out as a guest');
      }
      if (!input.shippingAddress) {
        throw ApiError.badRequest('A shipping address is required');
      }
      const products = await prisma.product.findMany({
        where: { id: { in: input.items.map((i) => i.productId) } },
      });
      lines = input.items.map((it) => {
        const product = products.find((p) => p.id === it.productId);
        if (!product) throw ApiError.badRequest('One of the items in your cart is no longer available');
        return priceLine(product, it.quantity);
      });
    }

    // 4 · coupon (server-authoritative)
    let coupon: Coupon | null = null;
    if (input.couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
      if (!coupon) throw ApiError.badRequest('Invalid coupon code');
    }

    // 5–6 · totals (base currency)
    const totals = computeTotals(
      lines.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice })),
      coupon,
    );

    // 6b · payment-method rules (checked against the BASE total)
    let shippingFee = totals.shippingFee;
    let grandTotal = totals.total;
    if (input.paymentMethod === 'COD') {
      if (!isCodEnabled()) {
        throw ApiError.badRequest('Cash on Delivery is currently unavailable');
      }
      const surcharge = money(codFee());
      if (surcharge.gt(0)) {
        shippingFee = money(shippingFee.add(surcharge));
        grandTotal = money(grandTotal.add(surcharge));
      }
      if (grandTotal.gt(codMaxOrder())) {
        throw ApiError.badRequest(
          `Cash on Delivery is not available for orders over ${codMaxOrder()} ${env.STORE_CURRENCY}. Please choose card payment.`,
        );
      }
    }

    // 6c · currency — convert every amount from base to the chosen currency
    const currency = (input.currency ?? currencyService.base).toUpperCase();
    if (!currencyService.isSupported(currency)) {
      throw ApiError.badRequest(`Unsupported currency: ${currency}`);
    }
    const toCur = (d: Prisma.Decimal) => money(currencyService.convert(toNumber(d)!, currency));
    const finalSubtotal = toCur(totals.subtotal);
    const finalDiscount = toCur(totals.discount);
    const finalShipping = toCur(shippingFee);
    const finalTotal = toCur(grandTotal);
    const finalLines = lines.map((l) => ({
      ...l,
      unitPrice: toCur(l.unitPrice),
      totalPrice: toCur(l.totalPrice),
    }));

    const shippingAddress = userId
      ? await resolveShippingAddress(userId, input)
      : input.shippingAddress!;
    const orderNumber = generateOrderNumber();

    // 7–10 · atomic order creation + inventory decrement + cart clear
    const order = await prisma.$transaction(async (tx) => {
      for (const line of finalLines) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, isActive: true, stockQuantity: { gte: line.quantity } },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (updated.count !== 1) {
          throw ApiError.conflict(`${line.productName} sold out while checking out`);
        }
      }

      if (coupon) {
        const bumped = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            OR: [{ usageLimit: null }, { usedCount: { lt: coupon.usageLimit ?? 0 } }],
          },
          data: { usedCount: { increment: 1 } },
        });
        if (bumped.count !== 1) throw ApiError.badRequest('This coupon can no longer be applied');
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? undefined,
          isGuest: !userId,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: input.paymentMethod,
          subtotal: finalSubtotal,
          shippingFee: finalShipping,
          discount: finalDiscount,
          total: finalTotal,
          currency,
          customerEmail: input.customerEmail ?? user!.email,
          customerPhone: input.customerPhone ?? user?.phone ?? null,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          notes: input.notes,
          shippingAddressSnapshot: JSON.stringify(shippingAddress),
          items: {
            create: finalLines.map((l) => ({
              productId: l.productId,
              productName: l.productName,
              sku: l.sku,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              totalPrice: l.totalPrice,
            })),
          },
        },
        include: orderInclude,
      });

      if (cartId) await tx.cartItem.deleteMany({ where: { cartId } });
      return created;
    });

    // 11 · payment intent (outside the DB transaction — external call).
    //   COD  → intent PENDING, order still CONFIRMED (cash collected on delivery)
    //   CARD → mock provider captures immediately → PAID
    try {
      const provider = getPaymentProviderForMethod(input.paymentMethod);
      const intent = await provider.createIntent({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: toNumber(order.total)!,
        currency: order.currency,
        customerEmail: order.customerEmail,
      });
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: intent.provider,
          providerRef: intent.reference,
          amount: order.total,
          currency: order.currency,
          status:
            intent.status === 'PAID' ? 'PAID' : intent.status === 'FAILED' ? 'FAILED' : 'PENDING',
          rawResponse: JSON.stringify(intent.raw ?? {}),
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus:
            intent.status === 'PAID' ? 'PAID' : intent.status === 'FAILED' ? 'FAILED' : 'PENDING',
          // A failed card payment leaves the order PENDING for retry; otherwise confirm it.
          status: intent.status === 'FAILED' ? 'PENDING' : 'CONFIRMED',
        },
      });
    } catch (err) {
      logger.error(err, 'payment intent failed');
    }

    const finalOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });

    emailService
      .orderConfirmation(
        finalOrder.customerEmail,
        finalOrder.orderNumber,
        toNumber(finalOrder.total)!,
        finalOrder.currency,
        finalOrder.paymentMethod,
      )
      .catch((e) => logger.warn(e, 'order confirmation email failed'));

    return mapOrder(finalOrder);
  },

  async listForUser(userId: string, query: OrderListQuery) {
    const where: Prisma.OrderWhereInput = { userId };
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { orders: rows.map(mapOrder), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getForUser(userId: string, id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order || order.userId !== userId) throw ApiError.notFound('Order not found');
    return mapOrder(order);
  },

  async getByNumberForUser(userId: string, orderNumber: string) {
    const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
    if (!order || order.userId !== userId) throw ApiError.notFound('Order not found');
    return mapOrder(order);
  },

  /** Guest order lookup — order number + the email it was placed with. */
  async guestLookup(orderNumber: string, email: string) {
    const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
    if (!order || order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      throw ApiError.notFound('Order not found');
    }
    return mapOrder(order);
  },

  async cancelForUser(userId: string, id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || order.userId !== userId) throw ApiError.notFound('Order not found');
    if (!CANCELLABLE.has(order.status)) {
      throw ApiError.badRequest(`An order that is ${order.status.toLowerCase()} cannot be cancelled`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
      if (order.couponId) {
        await tx.coupon.updateMany({
          where: { id: order.couponId, usedCount: { gt: 0 } },
          data: { usedCount: { decrement: 1 } },
        });
      }
      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
        },
        include: orderInclude,
      });
    });

    emailService
      .orderStatusUpdate(updated.customerEmail, updated.orderNumber, 'CANCELLED')
      .catch(() => undefined);
    return mapOrder(updated);
  },

  // ─── Admin ────────────────────────────────────────────────────────────

  async adminList(query: OrderListQuery) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { customerEmail: { contains: query.search } },
      ];
    }
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { orders: rows.map(mapOrder), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async adminGet(id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw ApiError.notFound('Order not found');
    return mapOrder(order);
  },

  async adminUpdateStatus(id: string, status: Prisma.OrderUpdateInput['status']) {
    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Order not found');

    const data: Prisma.OrderUpdateInput = { status };
    // Cash collected when a COD order is delivered.
    const codCollected =
      status === 'DELIVERED' &&
      exists.paymentMethod === 'COD' &&
      exists.paymentStatus === 'PENDING';
    if (codCollected) data.paymentStatus = 'PAID';

    if (codCollected) {
      await prisma.payment.updateMany({
        where: { orderId: id, provider: 'cod', status: 'PENDING' },
        data: { status: 'PAID' },
      });
    }

    const order = await prisma.order.update({ where: { id }, data, include: orderInclude });

    emailService
      .orderStatusUpdate(order.customerEmail, order.orderNumber, String(status))
      .catch(() => undefined);
    return mapOrder(order);
  },

  async adminUpdatePaymentStatus(id: string, paymentStatus: Prisma.OrderUpdateInput['paymentStatus']) {
    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Order not found');
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: orderInclude,
    });
    return mapOrder(order);
  },
};
