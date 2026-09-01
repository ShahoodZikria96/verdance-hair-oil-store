import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { currencyService } from '../services/currency';
import type { ApiCurrency } from '../types/api';

const STORAGE_KEY = 'verdance.currency';

interface CurrencyContextValue {
  /** Selected display currency code (e.g. "USD", "PKR"). */
  code: string;
  /** The store's base currency — all product prices are stored in this. */
  base: string;
  symbol: string;
  currencies: ApiCurrency[];
  setCurrency: (code: string) => void;
  /** Convert an amount in the BASE currency to the selected currency. */
  convert: (amountBase: number) => number;
  /** Convert + format an amount in the BASE currency for display. */
  format: (amountBase: number) => string;
  /** Format an amount that is ALREADY in `currency` (e.g. an order total). */
  formatIn: (amount: number, currency: string) => string;
  ready: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const FALLBACK: ApiCurrency[] = [{ code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }];

function formatMoney(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<ApiCurrency[]>(FALLBACK);
  const [base, setBase] = useState('USD');
  const [code, setCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'USD';
    } catch {
      return 'USD';
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    currencyService
      .list()
      .then((res) => {
        if (cancelled) return;
        setCurrencies(res.currencies.length ? res.currencies : FALLBACK);
        setBase(res.base);
        // If the stored choice is no longer supported, fall back to base.
        setCode((prev) =>
          res.currencies.some((c) => c.code === prev) ? prev : res.base,
        );
      })
      .catch(() => setCurrencies(FALLBACK))
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((next: string) => {
    setCode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const active = currencies.find((c) => c.code === code) ?? currencies[0] ?? FALLBACK[0];
    const rate = active.rate || 1;
    const convert = (amountBase: number) => Math.round(amountBase * rate * 100) / 100;
    return {
      code: active.code,
      base,
      symbol: active.symbol,
      currencies,
      setCurrency,
      convert,
      format: (amountBase: number) => formatMoney(convert(amountBase), active.code),
      formatIn: (amount: number, currency: string) => formatMoney(amount, currency),
      ready,
    };
  }, [currencies, code, base, setCurrency, ready]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
