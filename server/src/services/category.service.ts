import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { toSlug } from '../utils/slug';

const withCount = {
  _count: { select: { products: true } },
};

const map = (c: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  _count: { products: number };
}) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  imageUrl: c.imageUrl,
  isActive: c.isActive,
  productCount: c._count.products,
});

export const categoryService = {
  async list(includeInactive = false) {
    const rows = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: withCount,
      orderBy: { name: 'asc' },
    });
    return rows.map(map);
  },

  async getBySlug(slug: string) {
    const row = await prisma.category.findUnique({ where: { slug }, include: withCount });
    if (!row) throw ApiError.notFound('Category not found');
    return map(row);
  },

  async create(input: { name: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    const row = await prisma.category.create({
      data: { ...input, slug: input.slug ? toSlug(input.slug) : toSlug(input.name) },
      include: withCount,
    });
    return map(row);
  },

  async update(id: string, input: Record<string, unknown>) {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('Category not found');
    const data = { ...input };
    if (typeof data.slug === 'string') data.slug = toSlug(data.slug);
    const row = await prisma.category.update({ where: { id }, data, include: withCount });
    return map(row);
  },

  async remove(id: string) {
    const exists = await prisma.category.findUnique({ where: { id }, include: withCount });
    if (!exists) throw ApiError.notFound('Category not found');
    if (exists._count.products > 0) {
      const row = await prisma.category.update({ where: { id }, data: { isActive: false }, include: withCount });
      return map(row);
    }
    await prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  },
};
