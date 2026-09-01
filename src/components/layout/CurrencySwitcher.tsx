import { useCurrency } from '../../context/CurrencyContext';
import { Icon } from '../ui/Icon';
import { cn } from '../../lib/format';

export function CurrencySwitcher({ className }: { className?: string }) {
  const { code, currencies, setCurrency } = useCurrency();

  if (currencies.length <= 1) return null;

  return (
    <div className={cn('relative', className)}>
      <select
        value={code}
        onChange={(e) => setCurrency(e.target.value)}
        aria-label="Display currency"
        className="h-9 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent py-0 pl-2 pr-6 font-sans text-[13px] font-medium text-forest-900 transition-colors hover:border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-700"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} {c.symbol}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal-muted"
      />
    </div>
  );
}
