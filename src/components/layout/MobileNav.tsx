import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { primaryNav, socialLinks } from '../../data/content';
import { CurrencySwitcher } from './CurrencySwitcher';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { cn } from '../../lib/format';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileNav({ open, onClose, onOpenSearch }: MobileNavProps) {
  useLockBodyScroll(open);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] lg:hidden',
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
          'absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-ivory shadow-lift transition-transform duration-300 ease-premium',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-forest-900"
            aria-label="Close menu"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-5 py-6" aria-label="Mobile primary">
          {primaryNav.map((l) => {
            const to = l.href.startsWith('/#')
              ? { pathname: '/', hash: l.href.slice(1) }
              : l.href;
            return (
              <Link
                key={l.label}
                to={to}
                onClick={onClose}
                className="flex items-center justify-between border-b border-cream-100 py-4 font-display text-2xl text-forest-900"
              >
                {l.label}
                <Icon name="chevron-right" className="h-4 w-4 text-charcoal-muted" />
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 border-t border-cream-200 px-5 py-6">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium uppercase tracking-eyebrow text-charcoal-muted">
              Currency
            </span>
            <CurrencySwitcher />
          </div>
          <Button as="button" variant="secondary" fullWidth onClick={onOpenSearch}>
            <Icon name="search" className="h-4 w-4" />
            Search products
          </Button>
          <Button as="link" to="/shop" fullWidth onClick={onClose}>
            Shop Hair Oil
          </Button>
          <div className="flex items-center justify-center gap-5 pt-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-charcoal-light transition-colors hover:text-forest-900"
                aria-label={s.label}
              >
                <Icon name={s.icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
