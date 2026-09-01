import { api } from '../lib/api';
import type { ApiCurrencyList } from '../types/api';

export const currencyService = {
  list: () => api.get<ApiCurrencyList>('/currencies'),
};
