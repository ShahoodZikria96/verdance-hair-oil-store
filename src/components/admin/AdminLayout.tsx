import { useState } from 'react';
import { NavLink, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Logo } from '../layout/Logo';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/format';
import type { IconName } from '../../types';

const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'sparkle', end: true },
  { to: '/admin/orders', label: 'Orders', icon: 'bag' },
  { to: '/admin/products', label: 'Products', icon: 'droplet' },
  { to: '/admin/customers', label: 'Customers', icon: 'user' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'star' },
  { to: '/admin/coupons', label: 'Coupons', icon: 'refresh' },
  { to: '/admin/newsletter', label: 'Newsletter', icon: 'leaf' },
];

export function AdminLayout() {
  const { status, isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await logout();
    navigate('/', { replace: true });
  };

  if (signingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory font-sans text-sm text-charcoal-muted">
        Signing out…
      </div>
    );
  }
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory font-sans text-sm text-charcoal-muted">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={`/account?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-forest-700">
          <Icon name="shield" className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl">Admins only</h1>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          This area is restricted to store administrators.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-md bg-forest-800 px-6 py-3 font-sans text-sm font-medium text-cream-50"
        >
          Back to store
        </Link>
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-cream-100/10 px-6 py-6">
        <Logo tone="light" />
        <p className="mt-1 font-sans text-[11px] uppercase tracking-eyebrow text-gold-light">
          Admin Panel
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 font-sans text-sm transition-colors',
                isActive
                  ? 'bg-cream-100/10 font-medium text-cream-50'
                  : 'text-cream-100/60 hover:bg-cream-100/5 hover:text-cream-100',
              )
            }
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-cream-100/10 px-4 py-5">
        <p className="px-2 font-sans text-xs text-cream-100/50">{user?.email}</p>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-2 py-2 font-sans text-xs text-cream-100/60 hover:text-cream-100"
        >
          <Icon name="arrow-left" className="h-3.5 w-3.5" />
          View store
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 font-sans text-xs text-cream-100/60 hover:text-cream-100"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-forest-900 lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-charcoal/50 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-64 bg-forest-900 transition-transform duration-300 ease-premium',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {SidebarContent}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-cream-200 bg-ivory/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-forest-900"
            aria-label="Open menu"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <span className="font-display text-lg text-forest-900">Admin</span>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
