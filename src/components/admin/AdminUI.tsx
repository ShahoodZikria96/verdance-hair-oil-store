import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { cn } from '../../lib/format';
import type { IconName } from '../../types';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 font-sans text-sm text-charcoal-light">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-cream-200 bg-white', className)}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-wide text-charcoal-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl text-forest-900">{value}</p>
          {hint && <p className="mt-1 font-sans text-xs text-charcoal-muted">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            tone === 'warn' ? 'bg-gold/10 text-gold-dark' : 'bg-forest-50 text-forest-700',
          )}
        >
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

const toneMap: Record<string, string> = {
  PENDING: 'bg-cream-100 text-charcoal-light',
  CONFIRMED: 'bg-forest-50 text-forest-700',
  PROCESSING: 'bg-forest-50 text-forest-700',
  SHIPPED: 'bg-forest-100 text-forest-800',
  DELIVERED: 'bg-forest-800 text-cream-50',
  CANCELLED: 'bg-red-50 text-red-600',
  PAID: 'bg-forest-800 text-cream-50',
  FAILED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-gold/15 text-gold-dark',
  COD: 'border border-cream-300 text-charcoal-light',
  CARD: 'border border-cream-300 text-charcoal-light',
  active: 'bg-forest-50 text-forest-700',
  inactive: 'bg-red-50 text-red-600',
  approved: 'bg-forest-800 text-cream-50',
  pending: 'bg-cream-100 text-charcoal-light',
  verified: 'bg-forest-50 text-forest-700',
};

export function Badge({ children }: { children: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-sm px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide',
        toneMap[children] ?? 'bg-cream-100 text-charcoal-light',
      )}
    >
      {children}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-between font-sans text-sm text-charcoal-light">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-md border border-cream-300 px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-md border border-cream-300 px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-cream-300 py-16 text-center font-sans text-sm text-charcoal-muted">
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <p className="py-16 text-center font-sans text-sm text-charcoal-muted">{label}</p>;
}

export const adminInput =
  'h-10 w-full rounded-md border border-cream-300 bg-white px-3 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700';

export function Labeled({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block font-sans text-xs font-medium text-charcoal">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-sans text-[11px] text-charcoal-muted">{hint}</span>}
    </label>
  );
}
