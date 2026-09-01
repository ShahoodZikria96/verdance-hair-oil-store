import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { ProductArt } from '../components/product/ProductArt';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressesService } from '../services/addresses';
import { couponsService } from '../services/misc';
import { ordersService, type CreateOrderInput } from '../services/orders';
import { ApiError } from '../lib/api';
import type {
  ApiAddress,
  ApiCouponPreview,
  ApiPaymentOption,
  PaymentMethod,
} from '../types/api';
import { cn } from '../lib/format';
import { useCurrency } from '../context/CurrencyContext';

const inputCls =
  'h-11 w-full rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-forest-700';

const FREE_SHIPPING = 50;
const SHIPPING_FEE = 5;

const blankAddress = {
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

export function CheckoutPage() {
  const { status, isAuthenticated } = useAuth();
  const { lines, subtotal, clearCart, guestPayload } = useCart();
  const { format, code: currencyCode } = useCurrency();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [newAddress, setNewAddress] = useState(blankAddress);
  const [saveAddress, setSaveAddress] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<ApiCouponPreview | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);

  const [paymentOptions, setPaymentOptions] = useState<ApiPaymentOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    ordersService
      .paymentOptions()
      .then((res) => setPaymentOptions(res.methods))
      .catch(() => setPaymentOptions([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId('new');
      return;
    }
    addressesService
      .list()
      .then((rows) => {
        setAddresses(rows);
        const def = rows.find((a) => a.isDefault) ?? rows[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => setAddresses([]));
  }, [isAuthenticated]);

  const discount = coupon?.discount ?? 0;
  const net = Math.max(0, subtotal - discount);
  const baseShipping = useMemo(
    () => (net === 0 || net >= FREE_SHIPPING ? 0 : SHIPPING_FEE),
    [net],
  );

  const codOption = paymentOptions.find((m) => m.code === 'COD');
  const codFee = paymentMethod === 'COD' ? codOption?.fee ?? 0 : 0;
  const codUnavailable =
    !!codOption &&
    (!codOption.enabled ||
      (codOption.maxOrderAmount != null && net + baseShipping > codOption.maxOrderAmount));

  // If COD becomes unavailable (e.g. cart grew past the limit), fall back to card.
  useEffect(() => {
    if (paymentMethod === 'COD' && codUnavailable) setPaymentMethod('CARD');
  }, [paymentMethod, codUnavailable]);

  const shipping = baseShipping;
  const total = net + baseShipping + codFee;

  if (status === 'loading') {
    return <div className="container-px py-32 text-center font-sans text-sm text-charcoal-muted">Loading…</div>;
  }
  if (lines.length === 0) {
    return (
      <div className="container-px py-24 text-center lg:py-32">
        <h1 className="text-3xl">Your cart is empty</h1>
        <p className="mt-3 font-sans text-sm text-charcoal-light">
          Add something to your cart before checking out.
        </p>
        <Button as="link" to="/shop" size="lg" className="mt-8">
          Shop Hair Oil
        </Button>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError('');
    try {
      const preview = await couponsService.validate(couponCode.trim(), subtotal);
      setCoupon(preview);
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof ApiError ? err.message : 'Invalid coupon');
    } finally {
      setCouponBusy(false);
    }
  };

  const setAddr = (k: keyof typeof blankAddress, v: string) =>
    setNewAddress((a) => ({ ...a, [k]: v }));

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());

  const placeOrder = async () => {
    if (!isAuthenticated && !emailValid) {
      setOrderError('Please enter a valid email address so we can send your order confirmation.');
      return;
    }
    setPlacing(true);
    setOrderError('');
    setFieldErrors({});
    try {
      const payload: CreateOrderInput = {
        paymentMethod,
        currency: currencyCode,
        couponCode: coupon?.code,
        notes: notes.trim() || undefined,
      };
      if (!isAuthenticated) {
        // Guest checkout — send the browser cart + an email, always a new address.
        payload.items = guestPayload();
        payload.customerEmail = guestEmail.trim();
        payload.shippingAddress = {
          ...newAddress,
          addressLine2: newAddress.addressLine2 || undefined,
        };
      } else if (selectedAddressId === 'new') {
        payload.shippingAddress = {
          ...newAddress,
          addressLine2: newAddress.addressLine2 || undefined,
        };
        payload.saveAddress = saveAddress;
      } else {
        payload.addressId = selectedAddressId;
      }
      const order = await ordersService.create(payload);
      await clearCart();
      navigate(`/order/${order.orderNumber}`, { replace: true, state: { order } });
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setOrderError(err.errors.length ? 'Please check the highlighted fields.' : err.message);
      } else {
        setOrderError('We could not place your order. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-px py-12 lg:py-16">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Complete your order</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Left: address + options */}
        <div className="space-y-10">
          {!isAuthenticated && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl text-forest-900">Contact</h2>
                <Link
                  to="/account?redirect=/checkout"
                  className="font-sans text-xs font-medium text-forest-800 underline underline-offset-4"
                >
                  Have an account? Sign in
                </Link>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-sans text-xs font-medium text-charcoal">
                  Email address
                </span>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
                <span className="mt-1 block font-sans text-[11px] text-charcoal-muted">
                  We&apos;ll send your order confirmation here. No account required.
                </span>
              </label>
            </section>
          )}

          <section>
            <h2 className="font-display text-xl text-forest-900">Shipping address</h2>

            {addresses.length > 0 && (
              <div className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
                      selectedAddressId === a.id ? 'border-forest-800 bg-forest-50' : 'border-cream-200',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                    />
                    <span className="font-sans text-sm text-charcoal-light">
                      <span className="block font-medium text-charcoal">
                        {a.firstName} {a.lastName}
                      </span>
                      {a.addressLine1}
                      {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state}{' '}
                      {a.postalCode}, {a.country}
                    </span>
                  </label>
                ))}
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 font-sans text-sm transition-colors',
                    selectedAddressId === 'new' ? 'border-forest-800 bg-forest-50' : 'border-cream-200',
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === 'new'}
                    onChange={() => setSelectedAddressId('new')}
                  />
                  Use a new address
                </label>
              </div>
            )}

            {selectedAddressId === 'new' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <AddrInput label="First name" value={newAddress.firstName} onChange={(v) => setAddr('firstName', v)} error={fieldErrors['shippingAddress.firstName']} />
                <AddrInput label="Last name" value={newAddress.lastName} onChange={(v) => setAddr('lastName', v)} error={fieldErrors['shippingAddress.lastName']} />
                <AddrInput className="sm:col-span-2" label="Phone" value={newAddress.phone} onChange={(v) => setAddr('phone', v)} error={fieldErrors['shippingAddress.phone']} />
                <AddrInput className="sm:col-span-2" label="Address line 1" value={newAddress.addressLine1} onChange={(v) => setAddr('addressLine1', v)} error={fieldErrors['shippingAddress.addressLine1']} />
                <AddrInput className="sm:col-span-2" label="Address line 2 (optional)" value={newAddress.addressLine2} onChange={(v) => setAddr('addressLine2', v)} />
                <AddrInput label="City" value={newAddress.city} onChange={(v) => setAddr('city', v)} error={fieldErrors['shippingAddress.city']} />
                <AddrInput label="State / Region" value={newAddress.state} onChange={(v) => setAddr('state', v)} error={fieldErrors['shippingAddress.state']} />
                <AddrInput label="Postal code" value={newAddress.postalCode} onChange={(v) => setAddr('postalCode', v)} error={fieldErrors['shippingAddress.postalCode']} />
                <AddrInput label="Country" value={newAddress.country} onChange={(v) => setAddr('country', v)} error={fieldErrors['shippingAddress.country']} />
                {isAuthenticated && (
                  <label className="sm:col-span-2 flex items-center gap-2 font-sans text-sm text-charcoal-light">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                    Save this address to my account
                  </label>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl text-forest-900">Order notes (optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Delivery instructions, gift note…"
              className="mt-3 w-full rounded-md border border-forest-200 bg-cream-50 p-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </section>

          <section>
            <h2 className="font-display text-xl text-forest-900">Payment method</h2>
            <div className="mt-4 space-y-3">
              {(paymentOptions.length
                ? paymentOptions
                : [
                    { code: 'COD', label: 'Cash on Delivery', description: 'Pay in cash when your order is delivered.', enabled: true, fee: 0, maxOrderAmount: null },
                    { code: 'CARD', label: 'Card payment', description: 'Simulated card payment — no card details are collected.', enabled: true, fee: 0, maxOrderAmount: null },
                  ] as ApiPaymentOption[]
              ).map((m) => {
                const disabled = m.code === 'COD' && codUnavailable;
                return (
                  <label
                    key={m.code}
                    className={cn(
                      'flex gap-3 rounded-lg border p-4 transition-colors',
                      disabled
                        ? 'cursor-not-allowed border-cream-200 opacity-55'
                        : 'cursor-pointer',
                      paymentMethod === m.code && !disabled
                        ? 'border-forest-800 bg-forest-50'
                        : 'border-cream-200',
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="mt-1"
                      disabled={disabled}
                      checked={paymentMethod === m.code}
                      onChange={() => setPaymentMethod(m.code)}
                    />
                    <span className="flex-1 font-sans text-sm">
                      <span className="flex items-center justify-between">
                        <span className="font-medium text-charcoal">{m.label}</span>
                        {m.code === 'COD' && (
                          <span className="rounded-sm bg-cream-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest-800">
                            No card needed
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-charcoal-light">{m.description}</span>
                      {m.code === 'COD' && m.fee > 0 && (
                        <span className="mt-0.5 block text-charcoal-muted">
                          + {format(m.fee)} handling fee
                        </span>
                      )}
                      {disabled && (
                        <span className="mt-1 block text-red-500">
                          Not available for this order total
                          {m.maxOrderAmount != null ? ` (max ${format(m.maxOrderAmount)})` : ''}.
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 font-sans text-[11px] text-charcoal-muted">
              Card payments are simulated in this demo — no card details are collected. The
              server always recalculates and confirms the final amount.
            </p>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-6">
            <h2 className="font-display text-xl text-forest-900">Order Summary</h2>

            <ul className="mt-4 space-y-3 border-b border-cream-200 pb-4">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-100">
                    <ProductArt artKey={l.image} className="h-10 w-10" />
                  </span>
                  <span className="flex-1 font-sans text-xs text-charcoal-light">
                    <span className="block font-medium text-charcoal">{l.name}</span>
                    Qty {l.quantity}
                  </span>
                  <span className="font-sans text-sm tabular-nums text-charcoal">
                    {format(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <label className="mb-1.5 block font-sans text-xs font-medium text-charcoal">
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className={inputCls}
                />
                <Button as="button" variant="secondary" size="sm" onClick={() => void applyCoupon()} disabled={couponBusy}>
                  {couponBusy ? '…' : 'Apply'}
                </Button>
              </div>
              {couponError && <p className="mt-1 font-sans text-[11px] text-red-500">{couponError}</p>}
              {coupon && (
                <p className="mt-1 flex items-center gap-1 font-sans text-[11px] font-medium text-forest-700">
                  <Icon name="check-circle" className="h-3.5 w-3.5" />
                  {coupon.code} applied
                </p>
              )}
            </div>

            <dl className="mt-5 space-y-2 border-t border-cream-200 pt-4 font-sans text-sm">
              <div className="flex justify-between text-charcoal-light">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{format(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-forest-700">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">−{format(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-charcoal-light">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{shipping === 0 ? 'Free' : format(shipping)}</dd>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-charcoal-light">
                  <dt>Cash on Delivery fee</dt>
                  <dd className="tabular-nums">{format(codFee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-semibold text-charcoal">
                <dt>Total</dt>
                <dd className="tabular-nums">{format(total)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-xs text-charcoal-muted">
                <dt>Payment</dt>
                <dd>{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card (simulated)'}</dd>
              </div>
            </dl>

            <p className="mt-3 font-sans text-[11px] text-charcoal-muted">
              The final total is recalculated and confirmed by the server when your order is placed.
            </p>

            {orderError && <p className="mt-3 font-sans text-sm text-red-500">{orderError}</p>}

            <Button
              as="button"
              size="lg"
              fullWidth
              className="mt-5"
              disabled={placing || (!isAuthenticated && !emailValid)}
              onClick={() => void placeOrder()}
            >
              {placing
                ? 'Placing order…'
                : paymentMethod === 'COD'
                  ? `Place order · Pay ${format(total)} on delivery`
                  : `Place order · ${format(total)}`}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AddrInput({
  label,
  value,
  onChange,
  error,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block font-sans text-xs font-medium text-charcoal">{label}</span>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="mt-1 block font-sans text-[11px] text-red-500">{error}</span>}
    </label>
  );
}
