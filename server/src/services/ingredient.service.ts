import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { toSlug } from '../utils/slug';

export const ingredientService = {
  list() {
    return prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
  },

  async getBySlug(slug: string) {
    const row = await prisma.ingredient.findUnique({
      where: { slug },
      include: {
        products: {
          where: { product: { isActive: true } },
          include: { product: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
    if (!row) throw ApiError.notFound('Ingredient not found');
    return {
      ...row,
      products: row.products.map((p) => p.product),
    };
  },

  create(input: { name: string; slug?: string; description?: string; benefit: string; imageUrl?: string }) {
    return prisma.ingredient.create({
      data: { ...input, slug: input.slug ? toSlug(input.slug) : toSlug(input.name) },
    });
  },

  async update(id: string, input: Record<string, unknown>) {
    const exists = await prisma.ingredient.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Ingredient not found');
    const data = { ...input };
    if (typeof data.slug === 'string') data.slug = toSlug(data.slug);
    return prisma.ingredient.update({ where: { id }, data });
  },

  async remove(id: string) {
    const exists = await prisma.ingredient.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Ingredient not found');
    await prisma.ingredient.delete({ where: { id } });
    return { id, deleted: true };
  },
};
