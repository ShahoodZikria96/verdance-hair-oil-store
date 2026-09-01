import { cn } from '../../lib/format';
import { formatCount } from '../../lib/format';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
  showValue?: boolean;
}

/** Accessible 5-star rating with fractional fill. */
export function Rating({ value, count, size = 'sm', className, showValue }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      aria-label={`Rated ${clamped.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}`}
    >
      <div className="flex items-center gap-0.5 text-gold">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, clamped - i));
          return (
            <span key={i} className={cn('relative inline-block', dim)}>
              <StarSvg className={cn(dim, 'absolute inset-0 text-cream-300')} filled />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarSvg className={cn(dim, 'text-gold')} filled />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="font-sans text-xs font-medium text-charcoal">
          {clamped.toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="font-sans text-xs text-charcoal-muted">
          ({formatCount(count)})
        </span>
      )}
    </div>
  );
}

function StarSvg({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />
    </svg>
  );
}
