import type { Prisma } from '@prisma/client';
import { toNumber } from '../utils/money';

export const productDetailInclude = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  categories: { include: { category: true } },
  ingredients: { include: { ingredient: true } },
  benefits: { orderBy: { sortOrder: 'asc' } },
  usageSteps: { orderBy: { stepNumber: 'asc' } },
  reviews: {
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true } } },
  },
  _count: { select: { reviews: { where: { isApproved: true } } } },
} satisfies Prisma.ProductInclude;

export const productListInclude = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 2 },
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

type ProductWithDetail = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;
type ProductWithList = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;

const NEW_WINDOW_DAYS = 45;

function isNew(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function badges(p: {
  isBestSeller: boolean;
  compareAtPrice: unknown;
  createdAt: Date;
}): string[] {
  const out: string[] = [];
  if (p.isBestSeller) out.push('Best Seller');
  if (isNew(p.createdAt)) out.push('New');
  if (p.compareAtPrice) out.push('Sale');
  out.push('Cruelty-Free');
  return out;
}

/** Rich shape for the product detail page. */
export function mapProductDetail(p: ProductWithDetail) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    size: p.size,
    price: toNumber(p.price)!,
    compareAtPrice: toNumber(p.compareAtPrice),
    currency: p.currency,
    rating: toNumber(p.rating)!,
    reviewCount: p._count.reviews,
    stockQuantity: p.stockQuantity,
    inStock: p.isActive && p.stockQuantity > 0,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNew: isNew(p.createdAt),
    badges: badges(p),
    categories: p.categories.map((c) => ({
      id: c.category.id,
      name: c.category.name,
      slug: c.category.slug,
    })),
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    ingredients: p.ingredients.map((pi) => ({
      id: pi.ingredient.id,
      name: pi.ingredient.name,
      slug: pi.ingredient.slug,
      benefit: pi.ingredient.benefit,
    })),
    benefits: p.benefits.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      icon: b.icon,
    })),
    usageSteps: p.usageSteps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
    })),
    reviews: p.reviews.map((r) => ({
      id: r.id,
      author: `${r.user.firstName} ${r.user.lastName.charAt(0)}.`.trim(),
      rating: r.rating,
      title: r.title,
      body: r.comment,
      date: r.createdAt.toISOString(),
      verified: r.isVerified,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Lean shape for grids / carousels. */
export function mapProductCard(p: ProductWithList) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortDescription: p.shortDescription,
    size: p.size,
    price: toNumber(p.price)!,
    compareAtPrice: toNumber(p.compareAtPrice),
    currency: p.currency,
    rating: toNumber(p.rating)!,
    reviewCount: p.reviewCount,
    stockQuantity: p.stockQuantity,
    inStock: p.isActive && p.stockQuantity > 0,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNew: isNew(p.createdAt),
    badges: badges(p),
    categories: p.categories.map((c) => ({ name: c.category.name, slug: c.category.slug })),
    images: p.images.map((img) => ({ imageUrl: img.imageUrl, altText: img.altText, isPrimary: img.isPrimary })),
    createdAt: p.createdAt.toISOString(),
  };
}

export type ProductDetailDTO = ReturnType<typeof mapProductDetail>;
export type ProductCardDTO = ReturnType<typeof mapProductCard>;
