import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Rating } from '../ui/Rating';
import { Badge } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { QuantitySelector } from '../ui/QuantitySelector';
import { ProductArt } from '../product/ProductArt';
import { productsService } from '../../services/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import type { Product } from '../../types';

export function FeaturedProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { isWishlisted, toggle } = useWishlist();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    productsService
      .getBestSeller(controller.signal)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <section className="bg-ivory py-20 lg:py-28" aria-labelledby="bestseller-heading">
      <div className="container-px">
        <Reveal className="flex flex-col items-center text-center">
          <span className="eyebrow">Best Seller</span>
          <h2 id="bestseller-heading" className="mt-3 text-3xl sm:text-4xl">
            Your everyday ritual for healthier-looking hair.
          </h2>
        </Reveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {loading || !product ? (
            <FeaturedSkeleton />
          ) : (
            <>
              <Reveal className="relative">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-cream-100 to-cream-50 shadow-soft">
                  <ProductArt artKey={product.images[0]} scene className="aspect-square w-full p-10" />
                </div>
                <div className="absolute left-5 top-5 flex flex-col gap-2">
                  <Badge tone="forest">Best Seller</Badge>
                  {product.compareAtPrice && <Badge tone="gold">Limited Offer</Badge>}
                </div>
              </Reveal>

              <Reveal delay={90} className="max-w-lg">
                <div className="flex items-center gap-3">
                  <Rating value={product.rating} size="md" showValue />
                  <span className="font-sans text-sm text-charcoal-muted">
                    {product.reviewCount.toLocaleString()} reviews
                  </span>
                </div>

                <h3 className="mt-3 text-3xl sm:text-4xl">{product.name}</h3>
                <p className="mt-3 font-sans text-base leading-relaxed text-charcoal-light">
                  {product.description}
                </p>

                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-display text-3xl text-forest-900">
                    {format(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="font-sans text-lg text-charcoal-muted line-through">
                      {format(product.compareAtPrice)}
                    </span>
                  )}
                  <span className="font-sans text-sm text-charcoal-muted">/ {product.size}</span>
                </div>

                {product.benefits.length > 0 && (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {product.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 font-sans text-sm text-charcoal-light">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <QuantitySelector value={qty} onChange={setQty} />
                  <Button
                    as="button"
                    size="lg"
                    className="flex-1 sm:flex-none"
                    disabled={!product.inStock}
                    onClick={() => void addItem(product, qty)}
                  >
                    {product.inStock
                      ? `Add to Cart — ${format(product.price * qty)}`
                      : 'Out of Stock'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => void toggle(product.id)}
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-md border border-forest-200 text-forest-800 transition-colors hover:border-forest-800 hover:text-gold"
                    aria-pressed={isWishlisted(product.id)}
                    aria-label="Add to wishlist"
                  >
                    <Icon name={isWishlisted(product.id) ? 'heart-filled' : 'heart'} className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-2 font-sans text-xs text-charcoal-muted">
                  <Icon name="truck" className="h-4 w-4" />
                  Free shipping over $50 · 30-day satisfaction guarantee
                </div>
              </Reveal>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <>
      <div className="aspect-square w-full animate-pulse rounded-xl bg-cream-200" />
      <div className="max-w-lg space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-cream-200" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-cream-200" />
        <div className="h-16 w-full animate-pulse rounded bg-cream-100" />
        <div className="h-8 w-40 animate-pulse rounded bg-cream-200" />
        <div className="h-12 w-full animate-pulse rounded bg-cream-200" />
      </div>
    </>
  );
}
