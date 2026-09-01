import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { wishlistService } from '../services/wishlist';
import { useAuth } from './AuthContext';
import { onAuthEvent } from './AuthContext';

interface WishlistContextValue {
  ids: Set<string>;
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  requiresAuth: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const entries = await wishlistService.list();
      setIds(new Set(entries.map((e) => e.product.id)));
    } catch {
      setIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  useEffect(
    () =>
      onAuthEvent((event) => {
        if (event === 'login') load();
        else setIds(new Set());
      }),
    [load],
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;
      const next = new Set(ids);
      const wasIn = next.has(productId);
      // optimistic
      if (wasIn) next.delete(productId);
      else next.add(productId);
      setIds(next);
      try {
        const entries = wasIn
          ? await wishlistService.remove(productId)
          : await wishlistService.add(productId);
        setIds(new Set(entries.map((e) => e.product.id)));
      } catch {
        load(); // reconcile on failure
      }
    },
    [ids, isAuthenticated, load],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.size,
      isWishlisted: (id: string) => ids.has(id),
      toggle,
      requiresAuth: !isAuthenticated,
    }),
    [ids, toggle, isAuthenticated],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
