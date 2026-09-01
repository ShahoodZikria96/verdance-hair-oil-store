import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { addressesService, type AddressInput } from '../services/addresses';
import { authService } from '../services/auth';
import { ordersService } from '../services/orders';
import type { ApiAddress, ApiOrder } from '../types/api';
import { formatPrice, cn } from '../lib/format';

const inputCls =
  'h-11 w-full rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700';

export function AccountPage() {
  const { status, isAuthenticated } = useAuth();

  if (status === 'loading') {
    return (
      <div className="container-px py-32 text-center">
        <p className="font-sans text-sm text-charcoal-muted">Loading…</p>
      </div>
    );
  }

  return isAuthenticated ? <AccountDashboard /> : <AuthForms />;
}

// ── Sign in / Register ──────────────────────────────────────────────────

function AuthForms() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/account';
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(err.errors.length ? '' : err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-px py-16 lg:py-24">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-center">Account</p>
        <h1 className="mt-3 text-center text-3xl sm:text-4xl">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>

        <div className="mt-8 flex rounded-md border border-cream-200 p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErrors({});
                setFormError('');
              }}
              className={cn(
                'flex-1 rounded-[4px] py-2 font-sans text-sm font-medium transition-colors',
                mode === m ? 'bg-forest-800 text-cream-50' : 'text-charcoal-light hover:text-forest-900',
              )}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={errors.firstName}>
                <input className={inputCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
              </Field>
              <Field label="Last name" error={errors.lastName}>
                <input className={inputCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
              </Field>
            </div>
          )}
          <Field label="Email" error={errors.email}>
            <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </Field>
          <Field
            label="Password"
            error={errors.password}
            hint={mode === 'register' ? 'At least 8 characters, with a number and mixed case.' : undefined}
          >
            <input type="password" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} required />
          </Field>
          {mode === 'register' && (
            <Field label="Phone (optional)" error={errors.phone}>
              <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
          )}

          {formError && <p className="font-sans text-sm text-red-500">{formError}</p>}

          <Button as="button" type="submit" fullWidth size="lg" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        {mode === 'login' && (
          <p className="mt-4 text-center font-sans text-xs text-charcoal-muted">
            <Link to="/account/reset-password" className="underline underline-offset-4">
              Forgot your password?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-sans text-xs font-medium text-charcoal">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block font-sans text-[11px] text-charcoal-muted">{hint}</span>}
      {error && <span className="mt-1 block font-sans text-[11px] text-red-500">{error}</span>}
    </label>
  );
}

// ── Signed-in dashboard ─────────────────────────────────────────────────

function AccountDashboard() {
  const { user, isAdmin, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  const signOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="container-px py-14 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Hello, {user?.firstName}</h1>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button as="link" to="/admin" size="sm">
              Admin panel
            </Button>
          )}
          <Button as="button" variant="secondary" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 rounded-lg border border-forest-200 bg-forest-50 px-5 py-4 font-sans text-sm text-forest-800">
          You&apos;re signed in as an administrator.{' '}
          <Link to="/admin" className="font-semibold underline underline-offset-4">
            Open the admin panel
          </Link>{' '}
          to manage orders, products, customers and more.
        </div>
      )}

      <div className="mt-8 flex gap-1 border-b border-cream-200">
        {(['profile', 'orders', 'addresses'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'relative px-4 py-3 font-sans text-sm font-medium capitalize transition-colors',
              tab === t ? 'text-forest-900' : 'text-charcoal-muted hover:text-charcoal',
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest-800" />}
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-2xl">
        {tab === 'profile' && <ProfilePanel onSaved={refreshUser} />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'addresses' && <AddressesPanel />}
      </div>
    </div>
  );
}

function ProfilePanel({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('saving');
    try {
      await authService.updateProfile({ firstName, lastName, phone: phone || undefined });
      await onSaved();
      setState('saved');
    } catch (err) {
      setState('error');
      setMessage(err instanceof ApiError ? err.message : 'Could not save changes.');
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </Field>
        <Field label="Last name">
          <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
      </div>
      <Field label="Email">
        <input className={cn(inputCls, 'opacity-60')} value={user?.email ?? ''} disabled />
      </Field>
      <Field label="Phone">
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      {state === 'error' && <p className="font-sans text-sm text-red-500">{message}</p>}
      {state === 'saved' && (
        <p className="flex items-center gap-1.5 font-sans text-sm text-forest-700">
          <Icon name="check-circle" className="h-4 w-4" /> Profile updated
        </p>
      )}
      <Button as="button" type="submit" disabled={state === 'saving'}>
        {state === 'saving' ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService
      .list(1, 20)
      .then((res) => setOrders(res.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="font-sans text-sm text-charcoal-muted">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cream-300 py-14 text-center">
        <p className="font-display text-xl text-forest-900">No orders yet</p>
        <p className="mt-2 font-sans text-sm text-charcoal-muted">Your placed orders will appear here.</p>
        <Button as="link" to="/shop" className="mt-5">
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-lg border border-cream-200 bg-ivory p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-sans text-sm font-semibold text-charcoal">{o.orderNumber}</p>
              <p className="font-sans text-xs text-charcoal-muted">
                {new Date(o.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className="rounded-sm bg-cream-100 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-forest-800">
              {o.status}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-cream-100 pt-3">
            <p className="font-sans text-xs text-charcoal-muted">
              {o.items.reduce((n, i) => n + i.quantity, 0)} item(s) ·{' '}
              {o.paymentMethod === 'COD' ? 'COD' : 'Card'} · {o.paymentStatus}
            </p>
            <div className="flex items-center gap-4">
              <span className="font-sans text-sm font-semibold text-charcoal">
                {formatPrice(o.total, o.currency)}
              </span>
              <Link
                to={`/order/${o.orderNumber}`}
                className="font-sans text-xs font-medium text-forest-800 underline underline-offset-4"
              >
                View
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const emptyAddress: AddressInput = {
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

function AddressesPanel() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiAddress | null>(null);
  const [adding, setAdding] = useState(false);

  const load = () =>
    addressesService
      .list()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <p className="font-sans text-sm text-charcoal-muted">Loading addresses…</p>;

  if (adding || editing) {
    return (
      <AddressForm
        initial={editing ?? emptyAddress}
        onCancel={() => {
          setAdding(false);
          setEditing(null);
        }}
        onDone={async () => {
          setAdding(false);
          setEditing(null);
          await load();
        }}
        id={editing?.id}
      />
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && (
        <p className="font-sans text-sm text-charcoal-muted">No saved addresses yet.</p>
      )}
      {addresses.map((a) => (
        <div key={a.id} className="rounded-lg border border-cream-200 bg-ivory p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-sm font-semibold text-charcoal">
                {a.firstName} {a.lastName}
                {a.isDefault && (
                  <span className="ml-2 rounded-sm bg-forest-50 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-forest-700">
                    Default
                  </span>
                )}
              </p>
              <p className="mt-1 font-sans text-sm text-charcoal-light">
                {a.addressLine1}
                {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state} {a.postalCode},{' '}
                {a.country}
              </p>
              <p className="mt-0.5 font-sans text-xs text-charcoal-muted">{a.phone}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 border-t border-cream-100 pt-3 font-sans text-xs font-medium">
            <button type="button" className="text-forest-800 underline underline-offset-4" onClick={() => setEditing(a)}>
              Edit
            </button>
            {!a.isDefault && (
              <button
                type="button"
                className="text-forest-800 underline underline-offset-4"
                onClick={async () => {
                  await addressesService.setDefault(a.id);
                  await load();
                }}
              >
                Make default
              </button>
            )}
            <button
              type="button"
              className="text-red-500 underline underline-offset-4"
              onClick={async () => {
                await addressesService.remove(a.id);
                await load();
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <Button as="button" variant="secondary" onClick={() => setAdding(true)}>
        Add an address
      </Button>
    </div>
  );
}

export function AddressForm({
  initial,
  id,
  onCancel,
  onDone,
  submitLabel = 'Save address',
}: {
  initial: AddressInput;
  id?: string;
  onCancel: () => void;
  onDone: () => void | Promise<void>;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<AddressInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof AddressInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      if (id) await addressesService.update(id, form);
      else await addressesService.create(form);
      await onDone();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-cream-200 bg-ivory p-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName}>
          <input className={inputCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input className={inputCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
        </Field>
      </div>
      <Field label="Phone" error={errors.phone}>
        <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
      </Field>
      <Field label="Address line 1" error={errors.addressLine1}>
        <input className={inputCls} value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} required />
      </Field>
      <Field label="Address line 2 (optional)" error={errors.addressLine2}>
        <input className={inputCls} value={form.addressLine2 ?? ''} onChange={(e) => set('addressLine2', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" error={errors.city}>
          <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} required />
        </Field>
        <Field label="State / Region" error={errors.state}>
          <input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)} required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Postal code" error={errors.postalCode}>
          <input className={inputCls} value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} required />
        </Field>
        <Field label="Country" error={errors.country}>
          <input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} required />
        </Field>
      </div>
      <label className="flex items-center gap-2 font-sans text-sm text-charcoal-light">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
        />
        Set as default address
      </label>
      <div className="flex gap-3">
        <Button as="button" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        <Button as="button" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
