import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(600).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const ingredientCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(1000).optional(),
  benefit: z.string().trim().min(2).max(240),
  imageUrl: z.string().trim().max(500).optional(),
});
export const ingredientUpdateSchema = ingredientCreateSchema.partial();

export const slugParamSchema = z.object({ slug: z.string().trim().min(1) });
export const idParamSchema = z.object({ id: z.string().trim().min(1) });
