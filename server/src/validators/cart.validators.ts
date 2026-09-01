import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .max(100),
});

export const itemParamSchema = z.object({ itemId: z.string().trim().min(1) });
