import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { toNumber, money } from '../utils/money';
import { computeTotals } from './pricing.service';
import { env } from '../config/env';

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: {
      product: {
        include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 } },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

async function getOrCreateCart(userId: string): Promise<CartWithItems> {
  const existing = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId }, include: cartInclude });
}

/** Presentation + server-calculated totals. Frontend totals are never used. */
function serialiseCart(cart: CartWithItems) {
  const lines = cart.items.map((item) => {
    const current = toNumber(item.product.price)!;
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      sku: item.product.sku,
      size: item.product.size,
      image: item.product.images[0]?.imageUrl ?? null,
      unitPrice: current,
      priceAtAddition: toNumber(item.priceAtAddition)!,
      quantity: item.quantity,
      lineTotal: toNumber(money(current * item.quantity))!,
      inStock: item.product.isActive && item.product.stockQuantity > 0,
      stockQuantity: item.product.stockQuantity,
      maxAvailable: item.product.stockQuantity,
    };
  });

  const totals = computeTotals(
    cart.items.map((i) => ({ quantity: i.quantity, unitPrice: i.product.price })),
    null,
  );

  return {
    id: cart.id,
    items: lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    currency: env.STORE_CURRENCY,
    freeShippingThreshold: env.FREE_SHIPPING_THRESHOLD,
    subtotal: toNumber(totals.subtotal)!,
    shipping: toNumber(totals.shippingFee)!,
    discount: toNumber(totals.discount)!,
    total: toNumber(totals.total)!,
  };
}

async function assertPurchasable(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Product not found');
  if (!product.isActive) throw ApiError.badRequest(`${product.name} is not available`);
  if (product.stockQuantity < quantity) {
    throw ApiError.badRequest(
      `Only ${product.stockQuantity} unit(s) of ${product.name} are in stock`,
    );
  }
  return product;
}

export const cartService = {
  async get(userId: string) {
    return serialiseCart(await getOrCreateCart(userId));
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find((i) => i.productId === productId);
    const nextQty = Math.min((existing?.quantity ?? 0) + quantity, 99);
    const product = await assertPurchasable(productId, nextQty);

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity: nextQty, priceAtAddition: product.price },
      update: { quantity: nextQty },
    });
    await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
    return this.get(userId);
  },

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw ApiError.notFound('Cart item not found');

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return this.get(userId);
    }
    await assertPurchasable(item.productId, quantity);
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.get(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw ApiError.notFound('Cart item not found');
    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.get(userId);
  },

  async clear(userId: string) {
    const cart = await getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.get(userId);
  },

  /**
   * Merge a guest (localStorage) cart into the server cart on login.
   * Quantities are summed and clamped to available stock; unknown or inactive
   * products are skipped silently so login never fails because of stale data.
   */
  async merge(userId: string, incoming: { productId: string; quantity: number }[]) {
    const cart = await getOrCreateCart(userId);
    const products = await prisma.product.findMany({
      where: { id: { in: incoming.map((i) => i.productId) } },
    });

    for (const line of incoming) {
      const product = products.find((p) => p.id === line.productId);
      if (!product || !product.isActive || product.stockQuantity < 1) continue;
      const existing = cart.items.find((i) => i.productId === line.productId);
      const merged = Math.min((existing?.quantity ?? 0) + line.quantity, product.stockQuantity, 99);
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        create: {
          cartId: cart.id,
          productId: product.id,
          quantity: merged,
          priceAtAddition: product.price,
        },
        update: { quantity: merged },
      });
    }
    return this.get(userId);
  },
};
