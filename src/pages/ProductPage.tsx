import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Badge } from '../components/ui/Badge';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { ProductArt } from '../components/product/ProductArt';
import { ProductGrid } from '../components/product/ProductGrid';
import { FAQAccordion } from '../components/sections/FAQAccordion';
import { productsService } from '../services/products';
import { ApiError } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/format';
import { useCurrency } from '../context/CurrencyContext';
import type { Product } from '../types';

const tabs = ['Description', 'Ingredients', 'Benefits', 'How To Use', 'Shipping', 'Reviews'] as const;
type Tab = (typeof tabs)[number];

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { format } = useCurrency();
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>('Description');

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setTab('Description');

    productsService
      .getBySlug(slug, controller.signal)
      .then((p) => {
        setProduct(p);
        return productsService.getRelated(slug, 4, controller.signal).catch(() => []);
      })
      .then((r) => setRelated(r ?? []))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setNotFound(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) return <ProductPageSkeleton />;

  if (notFound || !product) {
    return (
      <div className="container-px py-28 text-center lg:py-40">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">We couldn’t find that product</h1>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm text-charcoal-light">
          It may have been renamed or is no longer available.
        </p>
        <Button as="link" to="/shop" size="lg" className="mt-8">
          Back to the shop
        </Button>
      </div>
    );
  }

  const discounted = product.compareAtPrice && product.compareAtPrice > product.price;

  const buyNow = async () => {
    await addItem(product, qty);
    openCart();
  };

  return (
    <div className="bg-ivory">
      <div className="container-px pt-6">
        <nav className="flex items-center gap-1.5 font-sans text-xs text-charcoal-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-forest-800">Home</Link>
          <Icon name="chevron-right" className="h-3 w-3" />
          <Link to="/shop" className="hover:text-forest-800">Shop</Link>
          <Icon name="chevron-right" className="h-3 w-3" />
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      <div className="container-px grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-xl bg-gradient-to-b from-cream-100 to-cream-50 shadow-soft">
            <ProductArt
              artKey={product.images[activeImage] ?? product.images[0]}
              scene={activeImage === product.images.length - 1}
              className="aspect-square w-full p-10"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'overflow-hidden rounded-md border bg-cream-100 transition-colors',
                    activeImage === i ? 'border-forest-800' : 'border-cream-200 hover:border-forest-300',
                  )}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeImage === i}
                >
                  <ProductArt artKey={img} className="aspect-square w-full p-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-xl">
          <div className="flex flex-wrap gap-2">
            {product.badges.map((b) => (
              <Badge key={b} tone={b === 'New' ? 'gold' : 'cream'}>
                {b}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl">{product.name}</h1>
          <p className="mt-2 font-sans text-base text-charcoal-light">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3">
            <Rating value={product.rating} size="md" showValue />
            <a href="#reviews" className="font-sans text-sm text-charcoal-muted underline-offset-4 hover:underline">
              {product.reviewCount.toLocaleString()} reviews
            </a>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-forest-900">
              {format(product.price)}
            </span>
            {discounted && (
              <span className="font-sans text-lg text-charcoal-muted line-through">
                {format(product.compareAtPrice!)}
              </span>
            )}
            {product.size && (
              <span className="font-sans text-sm text-charcoal-muted">/ {product.size}</span>
            )}
          </div>

          <p className="mt-6 font-sans text-[15px] leading-relaxed text-charcoal-light">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-2 font-sans text-sm">
            <span
              className={cn(
                'flex h-2 w-2 rounded-full',
                product.inStock ? 'bg-forest-500' : 'bg-charcoal-muted',
              )}
            />
            <span className={product.inStock ? 'text-forest-700' : 'text-charcoal-muted'}>
              {product.inStock ? 'In stock — ships within 24 hours' : 'Currently out of stock'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} />
            <Button
              as="button"
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => void addItem(product, qty)}
            >
              Add to Cart
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
          <Button
            as="button"
            size="lg"
            variant="dark"
            fullWidth
            className="mt-3"
            disabled={!product.inStock}
            onClick={() => void buyNow()}
          >
            Buy Now
          </Button>

          <ul className="mt-8 grid gap-3 border-t border-cream-200 pt-6 sm:grid-cols-2">
            {[
              { icon: 'truck', text: 'Free shipping over $50' },
              { icon: 'refresh', text: '30-day satisfaction guarantee' },
              { icon: 'leaf', text: '100% natural botanical blend' },
              { icon: 'rabbit', text: 'Cruelty-free & vegan' },
            ].map((r) => (
              <li key={r.text} className="flex items-center gap-2.5 font-sans text-sm text-charcoal-light">
                <Icon name={r.icon as never} className="h-4 w-4 shrink-0 text-forest-600" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="reviews" className="scroll-mt-24 border-t border-cream-200 bg-cream-50 py-14 lg:py-20">
        <div className="container-px">
          <div className="flex flex-wrap gap-1 border-b border-cream-200">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'relative px-4 py-3 font-sans text-sm font-medium transition-colors',
                  tab === t ? 'text-forest-900' : 'text-charcoal-muted hover:text-charcoal',
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest-800" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 max-w-3xl">
            {tab === 'Description' && (
              <p className="font-sans text-[15px] leading-relaxed text-charcoal-light">
                {product.longDescription}
              </p>
            )}

            {tab === 'Ingredients' && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {product.ingredients.map((i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-cream-200 bg-ivory px-4 py-3 font-sans text-sm text-charcoal"
                  >
                    <Icon name="leaf" className="h-4 w-4 text-forest-600" />
                    {i}
                  </li>
                ))}
              </ul>
            )}

            {tab === 'Benefits' && (
              <ul className="space-y-3">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 font-sans text-[15px] text-charcoal-light">
                    <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {tab === 'How To Use' && (
              <ol className="space-y-5">
                {product.howToUse.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-display text-2xl text-gold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="pt-1 font-sans text-[15px] leading-relaxed text-charcoal-light">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {tab === 'Shipping' && (
              <div className="space-y-4 font-sans text-[15px] leading-relaxed text-charcoal-light">
                <p>
                  Orders are processed within 24 hours on business days. Standard delivery
                  takes 3–5 working days; express options are available at checkout.
                </p>
                <p>
                  Shipping is complimentary on all orders over $50. Below that, a flat $5
                  rate applies. We currently ship within the UK, EU, US and Canada.
                </p>
                <p>
                  Not the right fit? Return any product — opened or not — within 30 days for
                  a full refund.
                </p>
              </div>
            )}

            {tab === 'Reviews' && (
              <ReviewsTab
                product={product}
                slug={slug!}
                canReview={isAuthenticated}
                onSignIn={() => navigate(`/account?redirect=/product/${slug}`)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container-px py-14 lg:py-20">
        <h2 className="text-2xl sm:text-3xl">Good to know</h2>
        <div className="mt-6 max-w-3xl">
          <FAQAccordion
            defaultOpen={null}
            items={[
              {
                id: 'pp1',
                question: 'How often should I use this oil?',
                answer:
                  'Two to three times a week works for most hair types. Adjust up for very dry hair, down for fine or oil-prone hair.',
              },
              {
                id: 'pp2',
                question: 'Will it leave my hair greasy?',
                answer:
                  'Used as directed and washed out with a gentle shampoo, it rinses clean. Start with a small amount and build up as needed.',
              },
              {
                id: 'pp3',
                question: 'Is the fragrance natural?',
                answer:
                  'The scent comes entirely from the botanical oils — there is no added synthetic fragrance.',
              },
            ]}
          />
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-cream-200 bg-cream-50 py-14 lg:py-20">
          <div className="container-px">
            <h2 className="text-2xl sm:text-3xl">You may also like</h2>
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsTab({
  product,
  slug,
  canReview,
  onSignIn,
}: {
  product: Product;
  slug: string;
  canReview: boolean;
  onSignIn: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setMessage('Please write a little more detail.');
      setState('error');
      return;
    }
    setState('submitting');
    try {
      await productsService.submitReview(slug, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });
      setState('done');
      setMessage('Thank you — your review will appear once it has been approved.');
      setTitle('');
      setComment('');
    } catch (err) {
      setState('error');
      setMessage(err instanceof ApiError ? err.message : 'Could not submit your review.');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6 rounded-lg border border-cream-200 bg-ivory p-6 sm:flex-row sm:items-center">
        <div className="text-center sm:border-r sm:border-cream-200 sm:pr-8">
          <p className="font-display text-4xl text-forest-900">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} size="md" className="mt-1 justify-center" />
          <p className="mt-1 font-sans text-xs text-charcoal-muted">
            {product.reviewCount.toLocaleString()} reviews
          </p>
        </div>
        <div className="flex-1">
          <p className="font-sans text-sm text-charcoal-light">
            {product.reviews.length > 0
              ? 'Recent verified feedback from the Verdance community.'
              : 'No written reviews yet — be the first to share your experience.'}
          </p>
          <div className="mt-3">
            {canReview ? (
              <Button as="button" variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? 'Cancel' : 'Write a review'}
              </Button>
            ) : (
              <Button as="button" variant="secondary" size="sm" onClick={onSignIn}>
                Sign in to write a review
              </Button>
            )}
          </div>
        </div>
      </div>

      {showForm && canReview && state !== 'done' && (
        <form onSubmit={submit} className="mt-6 rounded-lg border border-cream-200 bg-ivory p-6">
          <div className="flex items-center gap-3">
            <span className="font-sans text-sm font-medium text-charcoal">Your rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className={cn('text-lg', n <= rating ? 'text-gold' : 'text-cream-300')}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mt-4 h-11 w-full rounded-md border border-forest-200 bg-cream-50 px-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think?"
            rows={4}
            className="mt-3 w-full rounded-md border border-forest-200 bg-cream-50 p-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-forest-700"
          />
          {state === 'error' && <p className="mt-2 font-sans text-xs text-red-500">{message}</p>}
          <Button as="button" type="submit" className="mt-4" disabled={state === 'submitting'}>
            {state === 'submitting' ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      )}

      {state === 'done' && (
        <p className="mt-6 flex items-center gap-2 rounded-md border border-forest-200 bg-forest-50 px-4 py-3 font-sans text-sm text-forest-800">
          <Icon name="check-circle" className="h-4 w-4" />
          {message}
        </p>
      )}

      <ul className="mt-6 space-y-5">
        {product.reviews.map((r) => (
          <li key={r.id} className="rounded-lg border border-cream-200 bg-ivory p-5">
            <div className="flex items-center justify-between">
              <Rating value={r.rating} size="sm" />
              {r.verified && (
                <span className="flex items-center gap-1 font-sans text-[11px] font-medium text-forest-700">
                  <Icon name="check-circle" className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            {r.title && (
              <p className="mt-2 font-sans text-sm font-semibold text-charcoal">{r.title}</p>
            )}
            <p className="mt-1 font-sans text-sm leading-relaxed text-charcoal-light">{r.body}</p>
            <p className="mt-3 font-sans text-xs text-charcoal-muted">
              {r.author} ·{' '}
              {new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="container-px grid animate-pulse gap-10 py-14 lg:grid-cols-2 lg:gap-16">
      <div className="aspect-square w-full rounded-xl bg-cream-200" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-cream-200" />
        <div className="h-10 w-3/4 rounded bg-cream-200" />
        <div className="h-5 w-40 rounded bg-cream-100" />
        <div className="h-8 w-32 rounded bg-cream-200" />
        <div className="h-20 w-full rounded bg-cream-100" />
        <div className="h-12 w-full rounded bg-cream-200" />
        <div className="h-12 w-full rounded bg-cream-200" />
      </div>
    </div>
  );
}
