import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { ProductArt } from '../product/ProductArt';
import { productsService } from '../../services/products';
import { useCurrency } from '../../context/CurrencyContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { cn } from '../../lib/format';
import type { Product } from '../../types';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { format } = useCurrency();
  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const t = setTimeout(() => {
      productsService
        .list({ search: q, limit: 5 }, controller.signal)
        .then((res) => setResults(res.products))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-charcoal/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 top-0 bg-ivory shadow-lift transition-transform duration-300 ease-premium',
          open ? 'translate-y-0' : '-translate-y-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="container-px py-6">
          <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-forest-300 pb-4">
            <Icon name="search" className="h-5 w-5 text-forest-700" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for oils, ingredients, concerns…"
              className="flex-1 bg-transparent font-display text-xl text-forest-900 placeholder:text-charcoal-muted focus:outline-none sm:text-2xl"
              aria-label="Search products"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-charcoal-light hover:text-forest-900"
              aria-label="Close search"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-5 min-h-[3rem] pb-2">
            {query.trim() === '' && (
              <p className="font-sans text-sm text-charcoal-muted">
                Try “rosemary”, “dry hair”, or “scalp”.
              </p>
            )}
            {query.trim() !== '' && searching && results.length === 0 && (
              <p className="font-sans text-sm text-charcoal-muted">Searching…</p>
            )}
            {query.trim() !== '' && !searching && results.length === 0 && (
              <p className="font-sans text-sm text-charcoal-muted">
                No matches for “{query}”. Press Enter to browse the full shop.
              </p>
            )}
            {results.length > 0 && (
              <ul className="divide-y divide-cream-100">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 transition-colors hover:bg-cream-50"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-cream-100">
                        <ProductArt artKey={p.images[0]} className="h-12 w-12" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-sans text-sm font-medium text-charcoal">
                          {p.name}
                        </span>
                        <span className="block font-sans text-xs text-charcoal-muted">
                          {p.category} · {p.size}
                        </span>
                      </span>
                      <span className="font-sans text-sm text-forest-800">
                        {format(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
