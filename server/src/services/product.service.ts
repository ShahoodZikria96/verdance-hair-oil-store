import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { toSlug } from '../utils/slug';
import { buildPageMeta } from '../utils/pagination';
import { productRepository } from '../repositories/product.repository';
import {
  mapProductCard,
  mapProductDetail,
  productDetailInclude,
} from './product.mapper';
import type {
  createProductSchema,
  updateProductSchema,
  ProductListQuery,
} from '../validators/product.validators';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createProductSchema>;
type UpdateInput = z.infer<typeof updateProductSchema>;

async function resolveCategoryIds(slugs: string[]): Promise<string[]> {
  if (!slugs.length) return [];
  const rows = await prisma.category.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const missing = slugs.filter((s) => !rows.some((r) => r.slug === s));
  if (missing.length) throw ApiError.badRequest(`Unknown category slug(s): ${missing.join(', ')}`);
  return rows.map((r) => r.id);
}

async function resolveIngredientIds(slugs: string[]): Promise<string[]> {
  if (!slugs.length) return [];
  const rows = await prisma.ingredient.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const missing = slugs.filter((s) => !rows.some((r) => r.slug === s));
  if (missing.length) throw ApiError.badRequest(`Unknown ingredient slug(s): ${missing.join(', ')}`);
  return rows.map((r) => r.id);
}

export const productService = {
  async list(query: ProductListQuery, opts: { publicOnly: boolean }) {
    const { items, total } = await productRepository.list(query, opts);
    return {
      products: items.map(mapProductCard),
      meta: buildPageMeta(total, query.page, query.limit),
    };
  },

  async getBySlug(slug: string, opts: { publicOnly: boolean }) {
    const product = await productRepository.findBySlug(slug, opts);
    if (!product) throw ApiError.notFound('Product not found');
    return mapProductDetail(product);
  },

  async getBestSeller(opts: { publicOnly: boolean }) {
    const product = (await productRepository.bestSeller(opts)) ?? null;
    if (!product) throw ApiError.notFound('No best seller configured');
    return mapProductDetail(product);
  },

  async getFeatured(limit: number, opts: { publicOnly: boolean }) {
    const rows = await productRepository.featured(limit, opts);
    return rows.map(mapProductCard);
  },

  async getRelated(slug: string, limit: number) {
    const rows = await productRepository.related(slug, limit);
    return rows.map(mapProductCard);
  },

  async create(input: CreateInput) {
    const slug = input.slug ? toSlug(input.slug) : toSlug(input.name);
    const [categoryIds, ingredientIds] = await Promise.all([
      resolveCategoryIds(input.categorySlugs),
      resolveIngredientIds(input.ingredientSlugs),
    ]);

    const data: Prisma.ProductCreateInput = {
      name: input.name,
      slug,
      sku: input.sku,
      shortDescription: input.shortDescription,
      description: input.description,
      size: input.size,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      currency: input.currency,
      stockQuantity: input.stockQuantity,
      lowStockThreshold: input.lowStockThreshold,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
      isBestSeller: input.isBestSeller,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      ingredients: { create: ingredientIds.map((ingredientId) => ({ ingredientId })) },
      benefits: { create: input.benefits },
      usageSteps: { create: input.usageSteps },
      images: { create: input.images },
    };

    const product = await prisma.product.create({ data, include: productDetailInclude });
    return mapProductDetail(product);
  },

  async update(id: string, input: UpdateInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Product not found');

    const data: Prisma.ProductUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = toSlug(input.slug);
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription;
    if (input.description !== undefined) data.description = input.description;
    if (input.size !== undefined) data.size = input.size;
    if (input.price !== undefined) data.price = input.price;
    if (input.compareAtPrice !== undefined) data.compareAtPrice = input.compareAtPrice;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.stockQuantity !== undefined) data.stockQuantity = input.stockQuantity;
    if (input.lowStockThreshold !== undefined) data.lowStockThreshold = input.lowStockThreshold;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.isBestSeller !== undefined) data.isBestSeller = input.isBestSeller;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });

      if (input.categorySlugs) {
        const categoryIds = await resolveCategoryIds(input.categorySlugs);
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId: id, categoryId })),
        });
      }
      if (input.ingredientSlugs) {
        const ingredientIds = await resolveIngredientIds(input.ingredientSlugs);
        await tx.productIngredient.deleteMany({ where: { productId: id } });
        await tx.productIngredient.createMany({
          data: ingredientIds.map((ingredientId) => ({ productId: id, ingredientId })),
        });
      }
      if (input.benefits) {
        await tx.productBenefit.deleteMany({ where: { productId: id } });
        await tx.productBenefit.createMany({
          data: input.benefits.map((b) => ({ ...b, productId: id })),
        });
      }
      if (input.usageSteps) {
        await tx.productUsageStep.deleteMany({ where: { productId: id } });
        await tx.productUsageStep.createMany({
          data: input.usageSteps.map((s) => ({ ...s, productId: id })),
        });
      }
      if (input.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: input.images.map((img) => ({ ...img, productId: id })),
        });
      }
    });

    return this.getBySlug((data.slug as string) ?? existing.slug, { publicOnly: false });
  },

  async setStock(id: string, stockQuantity: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');
    await prisma.product.update({ where: { id }, data: { stockQuantity } });
    return { id, stockQuantity };
  },

  /** Soft-delete: deactivate rather than destroy history. */
  async deactivate(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.notFound('Product not found');
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return { id, isActive: false };
  },

  async remove(id: string) {
    const inOrders = await prisma.orderItem.count({ where: { productId: id } });
    if (inOrders > 0) {
      // Preserve order history — deactivate instead of hard delete.
      return this.deactivate(id);
    }
    await prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  },
};
