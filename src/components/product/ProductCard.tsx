import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { ProductArt } from './ProductArt';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { cn } from '../../lib/format';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { isWishlisted, toggle, requiresAuth } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discounted =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        !product.inStock && 'opacity-90',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-cream-100">
        <Link
          to={`/product/${product.slug}`}
          className="block aspect-[4/5]"
          aria-label={product.name}
        >
          <ProductArt
            artKey={product.images[0]}
            className="h-full w-full p-6 transition-transform duration-500 ease-premium group-hover:scale-[1.05]"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isBestSeller && <Badge tone="forest">Best Seller</Badge>}
          {product.isNew && <Badge tone="gold">New</Badge>}
          {discounted && (
            <Badge tone="cream">
              Save {format(product.compareAtPrice! - product.price)}
            </Badge>
          )}
          {!product.inStock && <Badge tone="outline">Sold Out</Badge>}
        </div>

        <button
          type="button"
          onClick={() => void toggle(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/85 text-forest-800 shadow-soft backdrop-blur-sm transition-colors hover:text-gold"
          aria-pressed={wishlisted}
          title={requiresAuth ? 'Sign in to save to your wishlist' : undefined}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name={wishlisted ? 'heart-filled' : 'heart'} className="h-4 w-4" />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 ease-premium group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => addItem(product, 1)}
            className="w-full rounded-md bg-forest-800 py-2.5 font-sans text-xs font-medium tracking-wide text-cream-50 shadow-lift transition-colors hover:bg-forest-900 disabled:opacity-50"
          >
            {product.inStock ? 'Add to Cart' : 'Notify Me'}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Rating value={product.rating} size="sm" />
          <span className="font-sans text-xs text-charcoal-muted">
            {product.reviewCount.toLocaleString()}
          </span>
        </div>
        <h3 className="mt-1.5 font-display text-lg leading-snug text-forest-900">
          <Link to={`/product/${product.slug}`} className="hover:text-forest-700">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 font-sans text-sm text-charcoal-light">
          {product.description}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-sans text-base font-semibold text-charcoal">
            {format(product.price)}
          </span>
          {discounted && (
            <span className="font-sans text-sm text-charcoal-muted line-through">
              {format(product.compareAtPrice!)}
            </span>
          )}
          <span className="ml-auto font-sans text-xs text-charcoal-muted">{product.size}</span>
        </div>
      </div>
    </article>
  );
}
