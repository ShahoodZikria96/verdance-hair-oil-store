import { Link } from 'react-router-dom';
import { cn } from '../../lib/format';

export function Logo({
  className,
  tone = 'dark',
}: {
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Verdance — home"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          d="M16 4c-4 4.4-7.5 8.6-7.5 14A7.5 7.5 0 0 0 23.5 18c0-5.4-3.5-9.6-7.5-14Z"
          fill="none"
          stroke={tone === 'light' ? '#c9a96a' : '#1f3d2b'}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M16 12v11"
          stroke={tone === 'light' ? '#c9a96a' : '#1f3d2b'}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M16 17c1.8-1.4 3-2 4.6-2.2M16 20c-1.6-1.2-2.7-1.8-4.2-2"
          stroke={tone === 'light' ? '#c9a96a' : '#1f3d2b'}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-tight',
          tone === 'light' ? 'text-cream-50' : 'text-forest-900',
        )}
      >
        Verdance
      </span>
    </Link>
  );
}
