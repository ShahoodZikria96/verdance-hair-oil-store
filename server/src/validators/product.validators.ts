import { z } from 'zod';

export const productListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().optional(),
  ingredient: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  bestSeller: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sort: z
    .enum([
      'featured',
      'newest',
      'price_asc',
      'price_desc',
      'rating',
      'popularity',
      'best_selling',
    ])
    .default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

const benefitInput = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(400),
  icon: z.string().trim().max(40).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const usageStepInput = z.object({
  stepNumber: z.number().int().min(1).max(20),
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(400),
});

const imageInput = z.object({
  imageUrl: z.string().trim().min(1).max(500),
  altText: z.string().trim().max(160).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).optional(),
  sku: z.string().trim().min(2).max(64),
  shortDescription: z.string().trim().min(2).max(400),
  description: z.string().trim().min(2).max(6000),
  size: z.string().trim().max(40).optional(),
  price: z.number().positive().max(100000),
  compareAtPrice: z.number().positive().max(100000).nullable().optional(),
  currency: z.string().trim().length(3).default('USD'),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  categorySlugs: z.array(z.string().trim()).default([]),
  ingredientSlugs: z.array(z.string().trim()).default([]),
  benefits: z.array(benefitInput).default([]),
  usageSteps: z.array(usageStepInput).default([]),
  images: z.array(imageInput).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  sku: z.string().trim().min(2).max(64).optional(),
});

export const updateStockSchema = z.object({
  stockQuantity: z.number().int().min(0),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
