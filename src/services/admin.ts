import { api, type PageMeta } from '../lib/api';
import type {
  AdminAnalytics,
  AdminCoupon,
  AdminCustomer,
  AdminDashboard,
  AdminReview,
  ApiCategory,
  ApiOrder,
  ApiProductDetail,
  NewsletterSubscriber,
} from '../types/api';

interface Paged<T> {
  data: T;
  meta: PageMeta;
}

async function paged<T>(path: string, query?: Record<string, string | number | undefined>) {
  const { data, meta } = await api.getWithMeta<T>(path, query);
  return { data, meta: meta as PageMeta } as Paged<T>;
}

export interface CouponInput {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface ProductInput {
  name: string;
  slug?: string;
  sku: string;
  shortDescription: string;
  description: string;
  size?: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  categorySlugs: string[];
  ingredientSlugs: string[];
  benefits: { title: string; description: string; icon?: string; sortOrder: number }[];
  usageSteps: { stepNumber: number; title: string; description: string }[];
  images: { imageUrl: string; altText?: string; sortOrder: number; isPrimary: boolean }[];
}

export const adminService = {
  // Dashboard
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard'),
  analytics: (days = 30) => api.get<AdminAnalytics>('/admin/analytics', { days }),

  // Orders
  orders: (q: { status?: string; paymentStatus?: string; search?: string; page?: number }) =>
    paged<ApiOrder[]>('/admin/orders', { ...q, limit: 15 }),
  order: (id: string) => api.get<ApiOrder>(`/admin/orders/${id}`),
  setOrderStatus: (id: string, status: string) =>
    api.patch<ApiOrder>(`/admin/orders/${id}/status`, { status }),
  setPaymentStatus: (id: string, paymentStatus: string) =>
    api.patch<ApiOrder>(`/admin/orders/${id}/payment-status`, { paymentStatus }),

  // Customers
  customers: (q: { search?: string; page?: number }) =>
    paged<AdminCustomer[]>('/admin/customers', { ...q, limit: 20 }),
  customer: (id: string) => api.get<AdminCustomer>(`/admin/customers/${id}`),
  setCustomerActive: (id: string, isActive: boolean) =>
    api.patch<{ id: string; isActive: boolean }>(`/admin/customers/${id}/status`, { isActive }),

  // Reviews
  reviews: (q: { approved?: 'true' | 'false'; page?: number }) =>
    paged<AdminReview[]>('/admin/reviews', { ...q, limit: 20 }),
  approveReview: (id: string) => api.patch<{ id: string }>(`/admin/reviews/${id}/approve`),
  rejectReview: (id: string) => api.patch<{ id: string }>(`/admin/reviews/${id}/reject`),
  deleteReview: (id: string) => api.del<{ id: string }>(`/admin/reviews/${id}`),

  // Coupons
  coupons: () => api.get<AdminCoupon[]>('/admin/coupons'),
  createCoupon: (input: CouponInput) => api.post<AdminCoupon>('/admin/coupons', input),
  updateCoupon: (id: string, input: Partial<CouponInput>) =>
    api.put<AdminCoupon>(`/admin/coupons/${id}`, input),
  deleteCoupon: (id: string) => api.del<{ id: string }>(`/admin/coupons/${id}`),

  // Newsletter
  newsletter: (q: { subscribed?: 'true' | 'false'; page?: number }) =>
    paged<NewsletterSubscriber[]>('/admin/newsletter', { ...q, limit: 30 }),

  // Products (uses the main product routes with admin auth)
  products: (q: { search?: string; page?: number; category?: string }) =>
    paged<import('../types/api').ApiProductCard[]>('/products', {
      ...q,
      scope: 'admin',
      sort: 'newest',
      limit: 24,
    }),
  productDetail: (slug: string) => api.get<ApiProductDetail>(`/products/${slug}`),
  createProduct: (input: ProductInput) => api.post<ApiProductDetail>('/products', input),
  updateProduct: (id: string, input: Partial<ProductInput>) =>
    api.put<ApiProductDetail>(`/products/${id}`, input),
  setStock: (id: string, stockQuantity: number) =>
    api.patch<{ id: string; stockQuantity: number }>(`/products/${id}/stock`, { stockQuantity }),
  deleteProduct: (id: string) => api.del<{ id: string }>(`/products/${id}`),

  categories: () => api.get<ApiCategory[]>('/categories', { all: 'true' }),
  ingredients: () => api.get<{ id: string; name: string; slug: string }[]>('/ingredients'),
};
