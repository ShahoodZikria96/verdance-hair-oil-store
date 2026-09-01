import { api, type PageMeta } from '../lib/api';
import type {
  ApiCategory,
  ApiProductCard,
  ApiProductDetail,
  ApiReview,
} from '../types/api';
import type { Product, Review } from '../types';

// ── API → frontend model mapping ─────────────────────────────────────────

function mapReview(r: ApiReview): Review {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    title: r.title ?? undefined,
    body: r.body,
    date: r.date,
    verified: r.verified,
  };
}

export function mapProductCard(p: ApiProductCard): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.shortDescription,
    description: p.shortDescription,
    longDescription: p.shortDescription,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    currency: p.currency,
    rating: p.rating,
    reviewCount: p.reviewCount,
    size: p.size ?? '',
    category: p.categories[0]?.name ?? 'Hair Oil',
    badges: p.badges,
    images: p.images.map((i) => i.imageUrl),
    ingredients: [],
    benefits: [],
    howToUse: [],
    inStock: p.inStock,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    reviews: [],
  };
}

export function mapProductDetail(p: ApiProductDetail): Product {
  const base = mapProductCard({ ...p, categories: p.categories });
  return {
    ...base,
    description: p.shortDescription,
    longDescription: p.description,
    ingredients: p.ingredients.map((i) => i.name),
    benefits: p.benefits.map((b) => b.title),
    howToUse: [...p.usageSteps]
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map((s) => s.description),
    reviews: p.reviews.map(mapReview),
  };
}

// ── Query params ─────────────────────────────────────────────────────────

export interface ProductQuery {
  search?: string;
  category?: string;
  ingredient?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  bestSeller?: boolean;
  featured?: boolean;
  sort?:
    | 'featured'
    | 'best-selling'
    | 'newest'
    | 'price-asc'
    | 'price-desc'
    | 'rating';
  page?: number;
  limit?: number;
}

const sortMap: Record<NonNullable<ProductQuery['sort']>, string> = {
  featured: 'featured',
  'best-selling': 'best_selling',
  newest: 'newest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  rating: 'rating',
};

// ── Service ──────────────────────────────────────────────────────────────

export const productsService = {
  async list(query: ProductQuery = {}, signal?: AbortSignal) {
    const { data, meta } = await api.getWithMeta<ApiProductCard[]>(
      '/products',
      {
        search: query.search,
        category: query.category,
        ingredient: query.ingredient,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        minRating: query.minRating,
        bestSeller: query.bestSeller,
        featured: query.featured,
        sort: query.sort ? sortMap[query.sort] : undefined,
        page: query.page,
        limit: query.limit,
      },
      signal,
    );
    return { products: data.map(mapProductCard), meta: meta as PageMeta };
  },

  async getBySlug(slug: string, signal?: AbortSignal) {
    const data = await api.get<ApiProductDetail>(`/products/${slug}`, undefined, signal);
    return mapProductDetail(data);
  },

  async getBestSeller(signal?: AbortSignal) {
    const data = await api.get<ApiProductDetail>('/products/best-seller', undefined, signal);
    return mapProductDetail(data);
  },

  async getFeatured(limit = 8, signal?: AbortSignal) {
    const data = await api.get<ApiProductCard[]>('/products/featured', { limit }, signal);
    return data.map(mapProductCard);
  },

  async getRelated(slug: string, limit = 4, signal?: AbortSignal) {
    const data = await api.get<ApiProductCard[]>(`/products/${slug}/related`, { limit }, signal);
    return data.map(mapProductCard);
  },

  async getReviews(slug: string, page = 1, limit = 10) {
    const { data, meta } = await api.getWithMeta<ApiReview[]>(`/products/${slug}/reviews`, {
      page,
      limit,
    });
    return { reviews: data.map(mapReview), meta: meta as PageMeta };
  },

  submitReview(slug: string, input: { rating: number; title?: string; comment: string }) {
    return api.post<ApiReview>(`/products/${slug}/reviews`, input);
  },
};

export const categoriesService = {
  list: (signal?: AbortSignal) => api.get<ApiCategory[]>('/categories', undefined, signal),
};
