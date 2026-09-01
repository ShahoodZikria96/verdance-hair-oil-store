import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';
import { ProductGrid } from '../product/ProductGrid';
import { productsService } from '../../services/products';
import type { Product } from '../../types';

export function CollectionPreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    productsService
      .list({ sort: 'featured', limit: 4 }, controller.signal)
      .then((res) => setProducts(res.products))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (failed) return null;

  return (
    <section className="bg-ivory py-20 lg:py-28">
      <div className="container-px">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <SectionHeading
            eyebrow="The Collection"
            title="Oils for Every Routine"
            align="left"
            className="items-center sm:items-start"
          />
          <Link
            to="/shop"
            className="link-underline inline-flex items-center gap-1.5 font-sans text-sm font-medium text-forest-800"
          >
            View all products
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12">
          <ProductGrid products={products} loading={loading} skeletonCount={4} />
        </div>
      </div>
    </section>
  );
}
