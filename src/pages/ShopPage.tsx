import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { productsService, categoriesService, type ProductQuery } from '../services/products';
import { ApiError, type PageMeta } from '../lib/api';
import type { ApiCategory } from '../types/api';
import type { Product } from '../types';
import { cn } from '../lib/format';

type SortKey = NonNullable<ProductQuery['sort']>;

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const priceBands: { id: string; label: string; min?: number; max?: number }[] = [
  { id: 'all', label: 'Any price' },
  { id: 'under-35', label: 'Under $35', max: 34.99 },
  { id: '35-45', label: '$35 – $45', min: 35, max: 45 },
  { id: 'over-45', label: 'Over $45', min: 45.01 },
];

const PAGE_SIZE = 12;

export function ShopPage() {
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>(params.get('category') ?? 'all');
  const [priceBand, setPriceBand] = useState('all');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sort, setSort] = useState<SortKey>((params.get('sort') as SortKey) || 'featured');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load categories once.
  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [category, priceBand, debouncedQuery, sort]);

  // Keep the URL shareable.
  useEffect(() => {
    const next = new URLSearchParams();
    if (sort !== 'featured') next.set('sort', sort);
    if (debouncedQuery.trim()) next.set('q', debouncedQuery.trim());
    if (category !== 'all') next.set('category', category);
    setParams(next, { replace: true });
  }, [sort, debouncedQuery, category, setParams]);

  // Fetch products.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const band = priceBands.find((b) => b.id === priceBand)!;
    productsService
      .list(
        {
          search: debouncedQuery.trim() || undefined,
          category: category !== 'all' ? category : undefined,
          minPrice: band.min,
          maxPrice: band.max,
          sort,
          page,
          limit: PAGE_SIZE,
        },
        controller.signal,
      )
      .then((res) => {
        setProducts(res.products);
        setMeta(res.meta);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'We couldn’t load the collection. Please try again.',
        );
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, category, priceBand, sort, page]);

  const resetFilters = () => {
    setCategory('all');
    setPriceBand('all');
    setQuery('');
  };

  const filtersActive = category !== 'all' || priceBand !== 'all' || query.trim() !== '';
  const total = meta?.total ?? products.length;

  const categoryOptions = useMemo(
    () => [{ slug: 'all', name: 'All' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))],
    [categories],
  );

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-charcoal">
          Category
        </h3>
        <ul className="mt-3 space-y-1">
          {categoryOptions.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left font-sans text-sm transition-colors',
                  category === c.slug
                    ? 'bg-forest-50 font-medium text-forest-900'
                    : 'text-charcoal-light hover:bg-cream-100',
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-charcoal">
          Price
        </h3>
        <ul className="mt-3 space-y-1">
          {priceBands.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setPriceBand(b.id)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left font-sans text-sm transition-colors',
                  priceBand === b.id
                    ? 'bg-forest-50 font-medium text-forest-900'
                    : 'text-charcoal-light hover:bg-cream-100',
                )}
              >
                {b.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {filtersActive && (
        <button
          type="button"
          onClick={resetFilters}
          className="font-sans text-xs font-medium text-forest-700 underline underline-offset-4"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-ivory">
      <div className="border-b border-cream-200 bg-cream-50">
        <div className="container-px py-14 lg:py-20">
          <p className="eyebrow">Shop</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Hair Oil Collection</h1>
          <p className="mt-4 max-w-lg font-sans text-base text-charcoal-light">
            Cold-pressed botanical oils for the scalp and lengths — considered formulas for
            every hair goal.
          </p>
        </div>
      </div>

      <div className="container-px py-12 lg:py-16">
        <div className="flex flex-col gap-4 border-b border-cream-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="font-sans text-sm text-charcoal-light">
              <span className="font-semibold text-charcoal">{loading ? '—' : total}</span>{' '}
              {total === 1 ? 'product' : 'products'}
            </p>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-forest-200 px-3 py-2 font-sans text-xs font-medium text-forest-800 lg:hidden"
            >
              <Icon name="filter" className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="h-10 w-full rounded-md border border-forest-200 bg-cream-50 pl-9 pr-3 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>
            <label className="sr-only" htmlFor="sort">
              Sort by
            </label>
            <div className="relative">
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 appearance-none rounded-md border border-forest-200 bg-cream-50 pl-3 pr-9 font-sans text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest-700"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Icon
                name="chevron-down"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">{FilterPanel}</div>
          </aside>

          <div>
            {error ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-cream-300 py-20 text-center">
                <p className="font-display text-2xl text-forest-900">Something went wrong</p>
                <p className="mt-2 max-w-sm font-sans text-sm text-charcoal-muted">{error}</p>
                <Button as="button" variant="secondary" className="mt-5" onClick={() => setPage((p) => p)}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  loading={loading}
                  skeletonCount={6}
                  emptyState={
                    <>
                      <p className="font-display text-2xl text-forest-900">Nothing matches yet</p>
                      <p className="mt-2 max-w-xs font-sans text-sm text-charcoal-muted">
                        Try a broader category or clear your filters to see the full range.
                      </p>
                      <Button
                        as="button"
                        variant="secondary"
                        className="mt-5"
                        onClick={resetFilters}
                      >
                        Clear filters
                      </Button>
                    </>
                  }
                />

                {meta && meta.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-3">
                    <Button
                      as="button"
                      variant="secondary"
                      size="sm"
                      disabled={!meta.hasPrev || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <Icon name="arrow-left" className="h-4 w-4" />
                      Prev
                    </Button>
                    <span className="font-sans text-sm text-charcoal-light">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button
                      as="button"
                      variant="secondary"
                      size="sm"
                      disabled={!meta.hasNext || loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[75] lg:hidden',
          mobileFiltersOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileFiltersOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-charcoal/40 transition-opacity',
            mobileFiltersOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileFiltersOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-[85%] max-w-xs overflow-y-auto bg-ivory p-6 shadow-lift transition-transform duration-300 ease-premium',
            mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl text-forest-900">Filters</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 text-forest-900"
              aria-label="Close filters"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          {FilterPanel}
          <Button as="button" fullWidth className="mt-8" onClick={() => setMobileFiltersOpen(false)}>
            Show results
          </Button>
        </div>
      </div>
    </div>
  );
}
