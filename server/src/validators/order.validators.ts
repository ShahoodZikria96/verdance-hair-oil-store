import { z } from 'zod';

const inlineAddress = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(6).max(20),
  addressLine1: z.string().trim().min(3).max(160),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
});

const guestItem = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z
  .object({
    addressId: z.string().trim().min(1).optional(),
    shippingAddress: inlineAddress.optional(),
    saveAddress: z.boolean().default(false),
    paymentMethod: z.enum(['COD', 'CARD']).default('COD'),
    currency: z.string().trim().length(3).toUpperCase().optional(),
    couponCode: z.string().trim().min(1).toUpperCase().optional(),
    customerEmail: z.string().trim().toLowerCase().email().optional(),
    customerPhone: z.string().trim().min(6).max(20).optional(),
    notes: z.string().trim().max(500).optional(),
    // Guest checkout: the cart lives in the browser, so it is sent with the order.
    items: z.array(guestItem).min(1).max(50).optional(),
  })
  .refine((v) => v.addressId || v.shippingAddress, {
    message: 'Provide either addressId or shippingAddress',
    path: ['addressId'],
  });

export const guestLookupSchema = z.object({
  orderNumber: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
});

export const orderListQuerySchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export const idParamSchema = z.object({ id: z.string().trim().min(1) });
