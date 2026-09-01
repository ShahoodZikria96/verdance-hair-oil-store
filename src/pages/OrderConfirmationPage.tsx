import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders';
import { ApiError } from '../lib/api';
import type { ApiOrder } from '../types/api';
import { formatPrice } from '../lib/format';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { status, isAuthenticated } = useAuth();

  // A guest who just placed an order arrives with it in navigation state.
  const passedOrder = (location.state as { order?: ApiOrder } | null)?.order;
  const initialOrder =
    passedOrder && passedOrder.orderNumber === orderNumber ? passedOrder : null;

  const [order, setOrder] = useState<ApiOrder | null>(initialOrder);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'guest'>(
    initialOrder ? 'ready' : 'loading',
  );
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (initialOrder || !orderNumber) return;
    if (isAuthenticated) {
      ordersService
        .getByNumber(orderNumber)
        .then((o) => {
          setOrder(o);
          setState('ready');
        })
        .catch(() => setState('error'));
    } else {
      // Guest with no navigation state (e.g. refreshed the page) — ask for the email.
      setState('guest');
    }
  }, [isAuthenticated, orderNumber, initialOrder]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    setLookupBusy(true);
    setLookupError('');
    try {
      const o = await ordersService.guestLookup(orderNumber, lookupEmail.trim());
      setOrder(o);
      setState('ready');
    } catch (err) {
      setLookupError(err instanceof ApiError ? err.message : 'Order not found.');
    } finally {
      setLookupBusy(false);
    }
  };

  if (status === 'loading') {
    return <div className="container-px py-32 text-center font-sans text-sm text-charcoal-muted">Loading…</div>;
  }
  if (state === 'guest') {
    return (
      <div className="container-px py-20 lg:py-28">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="text-3xl">View your order</h1>
          <p className="mt-3 font-sans text-sm text-charcoal-light">
            Enter the email address used for order{' '}
            <span className="font-semibold text-charcoal">{orderNumber}</span>.
          </p>
          <form onSubmit={lookup} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
            {lookupError && <p className="font-sans text-xs text-red-500">{lookupError}</p>}
            <Button as="button" type="submit" fullWidth size="lg" disabled={lookupBusy}>
              {lookupBusy ? 'Looking up…' : 'View order'}
            </Button>
          </form>
        </div>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="container-px py-28 text-center">
        <h1 className="text-3xl">Order not found</h1>
        <p className="mt-3 font-sans text-sm text-charcoal-light">
          We couldn’t find that order.
        </p>
        <Button as="link" to={isAuthenticated ? '/account' : '/'} className="mt-6">
          {isAuthenticated ? 'View your orders' : 'Back to store'}
        </Button>
      </div>
    );
  }
  if (state === 'loading' || !order) {
    return <div className="container-px py-32 text-center font-sans text-sm text-charcoal-muted">Loading your order…</div>;
  }

  const addr = order.shippingAddress;

  return (
    <div className="container-px py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700">
            <Icon name="check-circle" className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl sm:text-4xl">Thank you for your order</h1>
          <p className="mt-3 font-sans text-sm text-charcoal-light">
            A confirmation has been sent to {order.customerEmail}. Your order number is{' '}
            <span className="font-semibold text-charcoal">{order.orderNumber}</span>.
          </p>
        </div>

        <div className="mt-10 rounded-lg border border-cream-200 bg-cream-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-sans text-xs text-charcoal-muted">
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-sm border border-cream-300 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-charcoal-light">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}
              </span>
              <span className="rounded-sm bg-forest-800 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-cream-50">
                {order.status}
              </span>
            </div>
          </div>

          {order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' && (
            <p className="mt-4 flex items-start gap-2 rounded-md border border-gold/30 bg-gold/5 px-4 py-3 font-sans text-sm text-charcoal-light">
              <Icon name="truck" className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              Please have {formatPrice(order.total, order.currency)} in cash ready for the courier
              on delivery.
            </p>
          )}

          <ul className="mt-4 divide-y divide-cream-200 border-y border-cream-200">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3 font-sans text-sm">
                <span className="text-charcoal">
                  {i.productName} <span className="text-charcoal-muted">× {i.quantity}</span>
                </span>
                <span className="tabular-nums text-charcoal">{formatPrice(i.totalPrice, order.currency)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 font-sans text-sm">
            <div className="flex justify-between text-charcoal-light">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal, order.currency)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-forest-700">
                <dt>Discount {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                <dd className="tabular-nums">−{formatPrice(order.discount, order.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between text-charcoal-light">
              <dt>Shipping</dt>
              <dd className="tabular-nums">
                {order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-semibold text-charcoal">
              <dt>{order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' ? 'Due on delivery' : 'Total'}</dt>
              <dd className="tabular-nums">{formatPrice(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-lg border border-cream-200 bg-ivory p-6 font-sans text-sm text-charcoal-light">
          <p className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-charcoal">
            Shipping to
          </p>
          <p className="mt-2">
            {addr.firstName} {addr.lastName}
            <br />
            {addr.addressLine1}
            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
            <br />
            {addr.city}, {addr.state} {addr.postalCode}
            <br />
            {addr.country}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {isAuthenticated ? (
            <Button as="link" to="/account" size="lg">
              View your orders
            </Button>
          ) : (
            <Button as="link" to="/" size="lg">
              Back to store
            </Button>
          )}
          <Button as="link" to="/shop" size="lg" variant="secondary">
            Continue shopping
          </Button>
        </div>
        {!isAuthenticated && (
          <p className="mt-4 text-center font-sans text-xs text-charcoal-muted">
            Keep your order number to check on it later —{' '}
            <Link to="/account" className="underline underline-offset-4">
              create an account
            </Link>{' '}
            to see all your orders in one place.
          </p>
        )}
      </div>
    </div>
  );
}
