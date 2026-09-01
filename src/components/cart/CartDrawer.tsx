import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { QuantitySelector } from '../ui/QuantitySelector';
import { ProductArt } from '../product/ProductArt';
import { useCart } from '../../context/CartContext';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { cn } from '../../lib/format';
import { useCurrency } from '../../context/CurrencyContext';

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    lines,
    subtotal,
    shipping,
    total,
    itemCount,
    amountToFreeShipping,
    freeShippingThreshold,
    setQuantity,
    removeItem,
  } = useCart();
  const { format } = useCurrency();

  useLockBodyScroll(isOpen);

  const progress = Math.min(
    100,
    ((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100,
  );

  return (
    <div
      className={cn('fixed inset-0 z-[80]', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-charcoal/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={closeCart}
      />

      <aside
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-lift transition-transform duration-350 ease-premium',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-cream-200 px-6 py-5">
          <h2 className="font-display text-xl text-forest-900">
            Your Cart{' '}
            <span className="font-sans text-sm text-charcoal-muted">({itemCount})</span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 text-forest-900 hover:text-gold"
            aria-label="Close cart"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        {lines.length > 0 && (
          <div className="border-b border-cream-200 px-6 py-4">
            {amountToFreeShipping > 0 ? (
              <p className="font-sans text-xs text-charcoal-light">
                Add{' '}
                <span className="font-semibold text-forest-800">
                  {format(amountToFreeShipping)}
                </span>{' '}
                more for free shipping.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 font-sans text-xs font-medium text-forest-700">
                <Icon name="check-circle" className="h-4 w-4" />
                You&apos;ve unlocked free shipping.
              </p>
            )}
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-forest-700 transition-all duration-500 ease-premium"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            <ul className="divide-y divide-cream-100">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-4 py-5">
                  <Link
                    to={`/product/${line.slug}`}
                    onClick={closeCart}
                    className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md bg-cream-100"
                  >
                    <ProductArt artKey={line.image} className="h-20 w-20" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        to={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="font-sans text-sm font-medium text-charcoal hover:text-forest-800"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        className="p-1 text-charcoal-muted transition-colors hover:text-forest-800"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 font-sans text-xs text-charcoal-muted">{line.size}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantitySelector
                        size="sm"
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.productId, q)}
                      />
                      <span className="font-sans text-sm font-medium tabular-nums text-charcoal">
                        {format(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="space-y-4 border-t border-cream-200 px-6 py-6">
            <dl className="space-y-2 font-sans text-sm">
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
              <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-semibold text-charcoal">
                <dt>Total</dt>
                <dd className="tabular-nums">{format(total)}</dd>
              </div>
            </dl>
            <Button as="link" to="/checkout" fullWidth size="lg" onClick={closeCart}>
              Checkout
            </Button>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block w-full text-center font-sans text-xs font-medium tracking-wide text-charcoal-light underline-offset-4 hover:underline"
            >
              View full cart
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-forest-700">
        <Icon name="bag" className="h-7 w-7" />
      </span>
      <p className="mt-5 font-display text-xl text-forest-900">Your cart is empty</p>
      <p className="mt-2 max-w-[16rem] font-sans text-sm text-charcoal-muted">
        Start your ritual with our best-selling Signature Hair Oil.
      </p>
      <Button as="link" to="/shop" className="mt-6" onClick={onClose}>
        Shop Hair Oil
      </Button>
    </div>
  );
}
