import { z } from 'zod';

export const couponCreateSchema = z
  .object({
    code: z.string().trim().min(3).max(40).toUpperCase(),
    description: z.string().trim().max(240).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minimumOrderAmount: z.number().nonnegative().nullable().optional(),
    maximumDiscount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    startsAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (v) => v.discountType !== 'PERCENTAGE' || v.discountValue <= 100,
    { message: 'Percentage discount cannot exceed 100', path: ['discountValue'] },
  );

export const couponUpdateSchema = z.object({
  description: z.string().trim().max(240).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().positive().optional(),
  minimumOrderAmount: z.number().nonnegative().nullable().optional(),
  maximumDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1).toUpperCase(),
  subtotal: z.number().nonnegative().optional(),
});

export const idParamSchema = z.object({ id: z.string().trim().min(1) });
