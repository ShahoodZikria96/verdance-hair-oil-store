import type { Prisma } from '@prisma/client';
import { toNumber } from '../utils/money';

export const orderInclude = {
  items: true,
  payments: { orderBy: { createdAt: 'desc' } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

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

function parseSnapshot(raw: string): AddressSnapshot | Record<string, never> {
  try {
    return JSON.parse(raw) as AddressSnapshot;
  } catch {
    return {};
  }
}

export function mapOrder(o: OrderWithRelations) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    isGuest: o.isGuest,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    currency: o.currency,
    subtotal: toNumber(o.subtotal)!,
    shippingFee: toNumber(o.shippingFee)!,
    discount: toNumber(o.discount)!,
    total: toNumber(o.total)!,
    couponCode: o.couponCode,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    notes: o.notes,
    shippingAddress: parseSnapshot(o.shippingAddressSnapshot),
    customer: o.user
      ? { id: o.user.id, name: `${o.user.firstName} ${o.user.lastName}`, email: o.user.email }
      : null,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice)!,
      totalPrice: toNumber(i.totalPrice)!,
    })),
    payments: o.payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      providerRef: p.providerRef,
      amount: toNumber(p.amount)!,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
