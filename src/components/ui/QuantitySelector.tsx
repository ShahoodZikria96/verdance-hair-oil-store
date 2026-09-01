import { Icon } from './Icon';
import { cn } from '../../lib/format';

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
  ariaLabel = 'Quantity',
}: QuantitySelectorProps) {
  const pad = size === 'sm' ? 'p-1.5' : 'p-2.5';
  const width = size === 'sm' ? 'w-8' : 'w-10';

  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));

  return (
    <div
      className={cn(
        'inline-flex items-center border border-forest-200 rounded-md bg-cream-50',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className={cn(
          pad,
          'text-forest-700 transition-colors hover:text-forest-900 disabled:opacity-30',
        )}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" className="w-4 h-4" />
      </button>
      <span
        className={cn(
          width,
          'text-center font-sans text-sm font-medium tabular-nums text-charcoal',
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className={cn(
          pad,
          'text-forest-700 transition-colors hover:text-forest-900 disabled:opacity-30',
        )}
        aria-label="Increase quantity"
      >
        <Icon name="plus" className="w-4 h-4" />
      </button>
    </div>
  );
}
