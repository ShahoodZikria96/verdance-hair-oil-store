import { ProductCard } from './ProductCard';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/format';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  className?: string;
  /** Show N skeleton cards instead of products. */
  loading?: boolean;
  skeletonCount?: number;
  emptyState?: React.ReactNode;
}

export function ProductGrid({
  products,
  className,
  loading,
  skeletonCount = 8,
  emptyState,
}: ProductGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4',
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-cream-300 py-20 text-center">
        {emptyState ?? (
          <>
            <p className="font-display text-2xl text-forest-900">No products found</p>
            <p className="mt-2 font-sans text-sm text-charcoal-muted">
              Try adjusting your filters or search terms.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 70}>
          <ProductCard product={p} />
        </Reveal>
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="aspect-[4/5] rounded-lg bg-cream-200" />
      <div className="mt-4 h-3 w-1/3 rounded bg-cream-200" />
      <div className="mt-3 h-4 w-2/3 rounded bg-cream-200" />
      <div className="mt-2 h-3 w-full rounded bg-cream-100" />
      <div className="mt-3 h-4 w-1/4 rounded bg-cream-200" />
    </div>
  );
}
