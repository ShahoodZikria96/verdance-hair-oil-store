import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ApiCart } from '../types/api';
import type { CartLine, Product } from '../types';
import { cartService } from '../services/cart';
import { onAuthEvent } from './AuthContext';

const STORAGE_KEY = 'verdance.cart.v1';
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5;

/**
 * Hybrid cart:
 *  - guests use a localStorage cart with client-side totals
 *  - authenticated users use the server cart (source of truth, server totals)
 *  - on login, a non-empty guest cart is merged into the server cart
 */

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  isOpen: boolean;
  isSyncing: boolean;
  mode: 'guest' | 'server';
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Snapshot of guest lines as {productId, quantity} — used by checkout/merge. */
  guestPayload: () => { productId: string; quantity: number }[];
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ── local storage helpers ───────────────────────────────────────────────

function readLocal(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable */
  }
}

function apiCartToLines(cart: ApiCart): CartLine[] {
  return cart.items.map((i) => ({
    lineId: i.id,
    productId: i.productId,
    name: i.name,
    slug: i.slug,
    price: i.unitPrice,
    size: i.size ?? '',
    image: i.image ?? '',
    quantity: i.quantity,
    maxAvailable: i.maxAvailable,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readLocal());
  const [serverCart, setServerCart] = useState<ApiCart | null>(null);
  const [mode, setMode] = useState<'guest' | 'server'>('guest');
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hydrated = useRef(false);

  // Persist guest cart.
  useEffect(() => {
    if (mode !== 'guest') return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    writeLocal(lines);
  }, [lines, mode]);

  // React to auth changes.
  useEffect(() => {
    return onAuthEvent(async (event) => {
      if (event === 'login') {
        setIsSyncing(true);
        try {
          const guestLines = readLocal();
          const payload = guestLines
            .filter((l) => l.quantity > 0)
            .map((l) => ({ productId: l.productId, quantity: l.quantity }));
          const cart = payload.length
            ? await cartService.merge(payload)
            : await cartService.get();
          setServerCart(cart);
          setLines(apiCartToLines(cart));
          setMode('server');
          writeLocal([]);
        } catch {
          // stay in guest mode if the server cart could not be loaded
        } finally {
          setIsSyncing(false);
        }
      } else {
        // logout → back to (empty) guest cart
        setServerCart(null);
        setMode('guest');
        const local = readLocal();
        setLines(local);
      }
    });
  }, []);

  const applyServerCart = useCallback((cart: ApiCart) => {
    setServerCart(cart);
    setLines(apiCartToLines(cart));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // ── mutations ─────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      setIsOpen(true);
      if (mode === 'server') {
        setIsSyncing(true);
        try {
          applyServerCart(await cartService.addItem(product.id, quantity));
        } finally {
          setIsSyncing(false);
        }
        return;
      }
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === product.id);
        if (existing) {
          return prev.map((l) =>
            l.productId === product.id
              ? { ...l, quantity: Math.min(l.quantity + quantity, 99) }
              : l,
          );
        }
        const line: CartLine = {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          size: product.size,
          image: product.images[0] ?? '',
          quantity,
        };
        return [...prev, line];
      });
    },
    [mode, applyServerCart],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (mode === 'server') {
        const line = lines.find((l) => l.productId === productId);
        if (!line?.lineId) return;
        setIsSyncing(true);
        try {
          applyServerCart(await cartService.updateItem(line.lineId, Math.max(0, quantity)));
        } finally {
          setIsSyncing(false);
        }
        return;
      }
      setLines((prev) =>
        prev
          .map((l) =>
            l.productId === productId
              ? { ...l, quantity: Math.max(0, Math.min(quantity, 99)) }
              : l,
          )
          .filter((l) => l.quantity > 0),
      );
    },
    [mode, lines, applyServerCart],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (mode === 'server') {
        const line = lines.find((l) => l.productId === productId);
        if (!line?.lineId) return;
        setIsSyncing(true);
        try {
          applyServerCart(await cartService.removeItem(line.lineId));
        } finally {
          setIsSyncing(false);
        }
        return;
      }
      setLines((prev) => prev.filter((l) => l.productId !== productId));
    },
    [mode, lines, applyServerCart],
  );

  const clearCart = useCallback(async () => {
    if (mode === 'server') {
      setIsSyncing(true);
      try {
        applyServerCart(await cartService.clear());
      } finally {
        setIsSyncing(false);
      }
      return;
    }
    setLines([]);
  }, [mode, applyServerCart]);

  const guestPayload = useCallback(
    () => lines.filter((l) => l.quantity > 0).map((l) => ({ productId: l.productId, quantity: l.quantity })),
    [lines],
  );

  // ── derived totals ────────────────────────────────────────────────────

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

    if (mode === 'server' && serverCart) {
      return {
        lines,
        itemCount,
        subtotal: serverCart.subtotal,
        shipping: serverCart.shipping,
        discount: serverCart.discount,
        total: serverCart.total,
        freeShippingThreshold: serverCart.freeShippingThreshold,
        amountToFreeShipping: Math.max(0, serverCart.freeShippingThreshold - serverCart.subtotal),
        isOpen,
        isSyncing,
        mode,
        openCart,
        closeCart,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
        guestPayload,
      };
    }

    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    return {
      lines,
      itemCount,
      subtotal,
      shipping,
      discount: 0,
      total: subtotal + shipping,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      isOpen,
      isSyncing,
      mode,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      guestPayload,
    };
  }, [
    lines,
    serverCart,
    mode,
    isOpen,
    isSyncing,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    guestPayload,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
