import { api } from '../lib/api';
import type { ApiCouponPreview } from '../types/api';

export const newsletterService = {
  subscribe: (email: string) => api.post<{ email: string; isSubscribed: boolean }>(
    '/newsletter/subscribe',
    { email },
  ),
};

export const couponsService = {
  validate: (code: string, subtotal: number) =>
    api.post<ApiCouponPreview>('/coupons/validate', { code, subtotal }),
};
