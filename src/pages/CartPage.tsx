import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { ProductArt } from '../components/product/ProductArt';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export function CartPage() {
  const {
    lines,
    subtotal,
    shipping,
    total,
    itemCount,
    amountToFreeShipping,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { format } = useCurrency();

  if (lines.length === 0) {
    return (
      <div className="container-px py-24 lg:py-32">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-forest-700">
            <Icon name="bag" className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-3xl">Your cart is empty</h1>
          <p className="mt-3 font-sans text-sm text-charcoal-light">
            Looks like you haven&apos;t added anything yet. Explore the collection and start
            your hair ritual.
          </p>
          <Button as="link" to="/shop" size="lg" className="mt-8">
            Shop Hair Oil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-px py-12 lg:py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Cart</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            Your Cart <span className="font-sans text-lg text-charcoal-muted">({itemCount})</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="font-sans text-xs font-medium text-charcoal-muted underline underline-offset-4 hover:text-forest-800"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <div>
          <ul className="divide-y divide-cream-200 border-y border-cream-200">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-5 py-6">
                <Link
                  to={`/product/${line.slug}`}
                  className="flex h-28 w-24 shrink-0 items-center justify-center rounded-md bg-cream-100"
                >
                  <ProductArt artKey={line.image} className="h-24 w-24" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/product/${line.slug}`}
                        className="font-display text-lg text-forest-900 hover:text-forest-700"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-0.5 font-sans text-xs text-charcoal-muted">{line.size}</p>
                    </div>
                    <p className="font-sans text-sm font-semibold tabular-nums text-charcoal">
                      {format(line.price * line.quantity)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QuantitySelector
                      value={line.quantity}
                      onChange={(q) => setQuantity(line.productId, q)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      className="flex items-center gap-1.5 font-sans text-xs font-medium text-charcoal-muted hover:text-forest-800"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-forest-800"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-cream-200 bg-cream-50 p-6">
            <h2 className="font-display text-xl text-forest-900">Order Summary</h2>

            {amountToFreeShipping > 0 && (
              <p className="mt-3 font-sans text-xs text-charcoal-light">
                You&apos;re {format(amountToFreeShipping)} away from free shipping.
              </p>
            )}

            <dl className="mt-5 space-y-3 border-t border-cream-200 pt-5 font-sans text-sm">
              <div className="flex justify-between text-charcoal-light">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{format(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-charcoal-light">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {shipping === 0 ? 'Free' : format(shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-charcoal-light">
                <dt>Estimated tax</dt>
                <dd className="tabular-nums">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-semibold text-charcoal">
                <dt>Total</dt>
                <dd className="tabular-nums">{format(total)}</dd>
              </div>
            </dl>

            <Button as="link" to="/checkout" size="lg" fullWidth className="mt-6">
              Proceed to Checkout
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 font-sans text-xs text-charcoal-muted">
              <Icon name="shield" className="h-4 w-4" />
              Secure checkout · encrypted payment
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((m) => (
                <span
                  key={m}
                  className="rounded-sm border border-cream-300 bg-ivory px-2 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-charcoal-muted"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-cream-200 bg-ivory p-5">
            <label htmlFor="promo" className="font-sans text-xs font-semibold uppercase tracking-eyebrow text-charcoal">
              Promo code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo"
                placeholder="Enter code"
                className="h-10 flex-1 rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
              <Button as="button" variant="secondary" size="sm">
                Apply
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
