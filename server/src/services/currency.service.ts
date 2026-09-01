import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from '../lib/logger';

const SYMBOLS: Record<string, string> = {
  USD: '$',
  PKR: '₨',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  INR: '₹',
  SAR: '﷼',
  CAD: 'CA$',
  AUD: 'A$',
};

const NAMES: Record<string, string> = {
  USD: 'US Dollar',
  PKR: 'Pakistani Rupee',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  INR: 'Indian Rupee',
  SAR: 'Saudi Riyal',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
};

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

function parseRates(): Record<string, number> {
  try {
    const parsed = JSON.parse(env.FX_RATES) as Record<string, number>;
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (err) {
    logger.warn(err, 'FX_RATES is not valid JSON — falling back to base only');
  }
  return { [env.STORE_CURRENCY.toUpperCase()]: 1 };
}

const rates = parseRates();
const base = env.STORE_CURRENCY.toUpperCase();
const supported = env.SUPPORTED_CURRENCIES.split(',')
  .map((s) => s.trim().toUpperCase())
  .filter((c) => c && rates[c] != null);

// Base must always be present with rate 1.
if (!supported.includes(base)) supported.unshift(base);
rates[base] = rates[base] ?? 1;

export const currencyService = {
  base,

  list(): { base: string; currencies: CurrencyInfo[] } {
    return {
      base,
      currencies: supported.map((code) => ({
        code,
        name: NAMES[code] ?? code,
        symbol: SYMBOLS[code] ?? code,
        rate: rates[code],
      })),
    };
  },

  isSupported(code: string): boolean {
    return supported.includes(code.toUpperCase());
  },

  rate(code: string): number {
    const r = rates[code.toUpperCase()];
    if (r == null) throw ApiError.badRequest(`Unsupported currency: ${code}`);
    return r;
  },

  /** Convert an amount in the BASE currency to `code`, rounded to 2 dp. */
  convert(amountBase: number, code: string): number {
    const upper = code.toUpperCase();
    if (upper === base) return Math.round(amountBase * 100) / 100;
    return Math.round(amountBase * this.rate(upper) * 100) / 100;
  },
};
