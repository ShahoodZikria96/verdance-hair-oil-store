import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { SearchOverlay } from './SearchOverlay';
import { CurrencySwitcher } from './CurrencySwitcher';
import { primaryNav } from '../../data/content';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/format';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const renderNavLink = (label: string, href: string) => {
    if (href.startsWith('/#')) {
      return (
        <Link
          key={label}
          to={{ pathname: '/', hash: href.slice(1) }}
          className="link-underline font-sans text-[13px] font-medium tracking-wide text-charcoal-light transition-colors hover:text-forest-900"
        >
          {label}
        </Link>
      );
    }
    return (
      <Link
        key={label}
        to={href}
        className={cn(
          'link-underline font-sans text-[13px] font-medium tracking-wide transition-colors hover:text-forest-900',
          location.pathname === href ? 'text-forest-900' : 'text-charcoal-light',
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 ease-premium',
          scrolled
            ? 'border-b border-cream-200 bg-ivory/90 backdrop-blur-md'
            : 'border-b border-transparent bg-ivory/40 backdrop-blur-sm',
        )}
      >
        <div className="container-px">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              scrolled ? 'h-16' : 'h-20',
            )}
          >
            {/* Left — logo */}
            <div className="flex flex-1 items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="-ml-2 p-2 text-forest-900"
                aria-label="Open menu"
              >
                <Icon name="menu" className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex items-center lg:flex-1">
              <Logo />
            </div>

            {/* Center — nav */}
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
              {primaryNav.map((l) => renderNavLink(l.label, l.href))}
            </nav>

            {/* Right — actions */}
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
              <CurrencySwitcher className="hidden sm:block" />
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-forest-900 transition-colors hover:text-gold"
                aria-label="Search"
              >
                <Icon name="search" className="h-5 w-5" />
              </button>
              <Link
                to="/account"
                className="hidden items-center p-2 text-forest-900 transition-colors hover:text-gold sm:flex"
                aria-label={isAuthenticated ? 'Your account' : 'Sign in'}
              >
                {isAuthenticated && user ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-800 font-sans text-[11px] font-semibold text-cream-50">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Icon name="user" className="h-5 w-5" />
                )}
              </Link>
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-forest-900 transition-colors hover:text-gold"
                aria-label={`Shopping bag, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              >
                <Icon name="bag" className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-forest-800 px-1 text-[10px] font-semibold text-cream-50">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenSearch={() => {
          setMobileOpen(false);
          setSearchOpen(true);
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
