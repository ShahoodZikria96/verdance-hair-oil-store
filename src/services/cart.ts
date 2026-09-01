import { api } from '../lib/api';
import type { ApiCart } from '../types/api';

export const cartService = {
  get: () => api.get<ApiCart>('/cart'),
  addItem: (productId: string, quantity = 1) =>
    api.post<ApiCart>('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiCart>(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.del<ApiCart>(`/cart/items/${itemId}`),
  clear: () => api.del<ApiCart>('/cart'),
  merge: (items: { productId: string; quantity: number }[]) =>
    api.post<ApiCart>('/cart/merge', { items }),
};
