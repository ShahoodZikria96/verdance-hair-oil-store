import { api } from '../lib/api';
import type { ApiAddress } from '../types/api';

export type AddressInput = Omit<ApiAddress, 'id' | 'isDefault'> & { isDefault?: boolean };

export const addressesService = {
  list: () => api.get<ApiAddress[]>('/addresses'),
  create: (input: AddressInput) => api.post<ApiAddress>('/addresses', input),
  update: (id: string, input: Partial<AddressInput>) => api.put<ApiAddress>(`/addresses/${id}`, input),
  remove: (id: string) => api.del<{ id: string }>(`/addresses/${id}`),
  setDefault: (id: string) => api.patch<ApiAddress[]>(`/addresses/${id}/default`),
};
