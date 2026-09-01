import { api, type PageMeta } from '../lib/api';
import type { ApiOrder, ApiPaymentOptions, PaymentMethod } from '../types/api';

export interface CreateOrderInput {
  addressId?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  saveAddress?: boolean;
  paymentMethod?: PaymentMethod;
  currency?: string;
  couponCode?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  /** Guest checkout — the browser's cart, since there is no server cart. */
  items?: { productId: string; quantity: number }[];
}

export const ordersService = {
  paymentOptions: () => api.get<ApiPaymentOptions>('/orders/payment-options'),

  create: (input: CreateOrderInput) => api.post<ApiOrder>('/orders', input),

  guestLookup: (orderNumber: string, email: string) =>
    api.get<ApiOrder>('/orders/lookup', { orderNumber, email }),

  async list(page = 1, limit = 10) {
    const { data, meta } = await api.getWithMeta<ApiOrder[]>('/orders', { page, limit });
    return { orders: data, meta: meta as PageMeta };
  },

  get: (id: string) => api.get<ApiOrder>(`/orders/${id}`),
  getByNumber: (orderNumber: string) => api.get<ApiOrder>(`/orders/by-number/${orderNumber}`),
  cancel: (id: string) => api.post<ApiOrder>(`/orders/${id}/cancel`),
};
