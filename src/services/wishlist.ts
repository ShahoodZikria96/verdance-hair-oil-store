import { api } from '../lib/api';
import type { ApiWishlistEntry } from '../types/api';

export const wishlistService = {
  list: () => api.get<ApiWishlistEntry[]>('/wishlist'),
  add: (productId: string) => api.post<ApiWishlistEntry[]>(`/wishlist/${productId}`),
  remove: (productId: string) => api.del<ApiWishlistEntry[]>(`/wishlist/${productId}`),
};
