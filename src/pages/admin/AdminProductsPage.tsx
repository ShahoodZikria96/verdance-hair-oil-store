import { useCallback, useEffect, useState } from 'react';
import { adminService, type ProductInput } from '../../services/admin';
import { ApiError } from '../../lib/api';
import type { ApiCategory, ApiProductCard, ApiProductDetail } from '../../types/api';
import { formatPrice, cn } from '../../lib/format';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { ProductArt } from '../../components/product/ProductArt';
import {
  Badge,
  Card,
  EmptyState,
  Labeled,
  PageHeader,
  Pagination,
  Spinner,
  adminInput,
} from '../../components/admin/AdminUI';

type Mode = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; slug: string };

export function AdminProductsPage() {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [products, setProducts] = useState<ApiProductCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [ingredients, setIngredients] = useState<{ id: string; name: string; slug: string }[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .products({ search: search || undefined, page })
      .then((res) => {
        setProducts(res.data);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    if (mode.kind === 'list') load();
  }, [mode, load]);

  useEffect(() => {
    adminService.categories().then(setCategories).catch(() => setCategories([]));
    adminService.ingredients().then(setIngredients).catch(() => setIngredients([]));
  }, []);

  const quickStock = async (id: string, value: number) => {
    try {
      await adminService.setStock(id, value);
      setProducts((list) => list.map((p) => (p.id === id ? { ...p, stockQuantity: value } : p)));
    } catch {
      load();
    }
  };

  const toggleFlag = async (
    p: ApiProductCard,
    flag: 'isFeatured' | 'isBestSeller',
  ) => {
    try {
      const updated = await adminService.updateProduct(p.id, { [flag]: !p[flag] } as Partial<ProductInput>);
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, [flag]: updated[flag] } : x)));
    } catch {
      load();
    }
  };

  if (mode.kind !== 'list') {
    return (
      <ProductForm
        slug={mode.kind === 'edit' ? mode.slug : undefined}
        categories={categories}
        ingredients={ingredients}
        onCancel={() => setMode({ kind: 'list' })}
        onSaved={() => setMode({ kind: 'list' })}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage the catalogue, pricing, stock and merchandising flags."
        action={
          <Button as="button" onClick={() => setMode({ kind: 'new' })}>
            <Icon name="plus" className="h-4 w-4" />
            New product
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="relative max-w-sm">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search products"
            className={cn(adminInput, 'pl-9')}
          />
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading products…" />
      ) : products.length === 0 ? (
        <EmptyState>No products found.</EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left font-sans text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-charcoal-muted">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Flags</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cream-100">
                        <ProductArt artKey={p.images[0]?.imageUrl ?? 'signature-front'} className="h-8 w-8" />
                      </span>
                      <div>
                        <p className="font-medium text-charcoal">{p.name}</p>
                        <p className="text-xs text-charcoal-muted">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-charcoal">
                    {formatPrice(p.price, p.currency)}
                    {p.compareAtPrice && (
                      <span className="ml-1 text-xs text-charcoal-muted line-through">
                        {formatPrice(p.compareAtPrice, p.currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      defaultValue={p.stockQuantity}
                      min={0}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== p.stockQuantity && v >= 0) void quickStock(p.id, v);
                      }}
                      className="w-20 rounded-md border border-cream-300 bg-white px-2 py-1 text-sm tabular-nums"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => void toggleFlag(p, 'isBestSeller')}
                        className={cn(
                          'rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                          p.isBestSeller ? 'border-forest-800 bg-forest-800 text-cream-50' : 'border-cream-300 text-charcoal-muted',
                        )}
                      >
                        Best
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleFlag(p, 'isFeatured')}
                        className={cn(
                          'rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                          p.isFeatured ? 'border-gold bg-gold text-white' : 'border-cream-300 text-charcoal-muted',
                        )}
                      >
                        Feat
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{p.inStock ? 'active' : p.stockQuantity === 0 ? 'inactive' : 'inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setMode({ kind: 'edit', slug: p.slug })}
                      className="font-sans text-xs font-medium text-forest-800 underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

// ── Product form ────────────────────────────────────────────────────────

const emptyForm: ProductInput = {
  name: '',
  sku: '',
  shortDescription: '',
  description: '',
  size: '',
  price: 0,
  compareAtPrice: null,
  currency: 'USD',
  stockQuantity: 0,
  lowStockThreshold: 5,
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  categorySlugs: [],
  ingredientSlugs: [],
  benefits: [],
  usageSteps: [],
  images: [],
};

function ProductForm({
  slug,
  categories,
  ingredients,
  onCancel,
  onSaved,
}: {
  slug?: string;
  categories: ApiCategory[];
  ingredients: { id: string; name: string; slug: string }[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    adminService
      .productDetail(slug)
      .then((p: ApiProductDetail) => {
        setProductId(p.id);
        setForm({
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          size: p.size ?? '',
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          currency: p.currency,
          stockQuantity: p.stockQuantity,
          lowStockThreshold: 5,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          categorySlugs: p.categories.map((c) => c.slug),
          ingredientSlugs: p.ingredients.map((i) => i.slug),
          benefits: p.benefits.map((b, idx) => ({
            title: b.title,
            description: b.description,
            icon: b.icon ?? '',
            sortOrder: idx,
          })),
          usageSteps: p.usageSteps.map((s) => ({
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
          })),
          images: p.images.map((im, idx) => ({
            imageUrl: im.imageUrl,
            altText: im.altText ?? '',
            sortOrder: idx,
            isPrimary: im.isPrimary ?? idx === 0,
          })),
        });
      })
      .catch(() => setError('Could not load this product.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleInArray = (key: 'categorySlugs' | 'ingredientSlugs', value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});
    const payload: ProductInput = {
      ...form,
      slug: form.slug || undefined,
      size: form.size || undefined,
      compareAtPrice: form.compareAtPrice || null,
      benefits: form.benefits.map((b, i) => ({ ...b, sortOrder: i, icon: b.icon || undefined })),
      usageSteps: form.usageSteps.map((s, i) => ({ ...s, stepNumber: i + 1 })),
      images: form.images.map((im, i) => ({ ...im, sortOrder: i, altText: im.altText || undefined })),
    };
    try {
      if (productId) await adminService.updateProduct(productId, payload);
      else await adminService.createProduct(payload);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setError(err.errors.length ? 'Please check the highlighted fields.' : err.message);
      } else {
        setError('Could not save the product.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading product…" />;

  return (
    <form onSubmit={submit} className="max-w-3xl">
      <PageHeader
        title={productId ? 'Edit product' : 'New product'}
        action={
          <div className="flex gap-2">
            <Button as="button" type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button as="button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </Button>
          </div>
        }
      />

      {error && <p className="mb-4 font-sans text-sm text-red-500">{error}</p>}

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Name" hint={fieldErrors.name}>
              <input className={adminInput} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Labeled>
            <Labeled label="SKU" hint={fieldErrors.sku}>
              <input className={adminInput} value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
            </Labeled>
            <Labeled label="Slug (optional)">
              <input className={adminInput} value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} placeholder="auto from name" />
            </Labeled>
            <Labeled label="Size">
              <input className={adminInput} value={form.size ?? ''} onChange={(e) => set('size', e.target.value)} placeholder="100 ml" />
            </Labeled>
          </div>
          <Labeled label="Short description" hint={fieldErrors.shortDescription}>
            <textarea className={cn(adminInput, 'h-auto py-2')} rows={2} value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} required />
          </Labeled>
          <Labeled label="Full description" hint={fieldErrors.description}>
            <textarea className={cn(adminInput, 'h-auto py-2')} rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </Labeled>
        </Card>

        <Card className="grid gap-4 p-6 sm:grid-cols-3">
          <Labeled label="Price" hint={fieldErrors.price}>
            <input type="number" step="0.01" min="0" className={adminInput} value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
          </Labeled>
          <Labeled label="Compare-at price">
            <input type="number" step="0.01" min="0" className={adminInput} value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : null)} />
          </Labeled>
          <Labeled label="Currency">
            <input className={adminInput} value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} />
          </Labeled>
          <Labeled label="Stock quantity">
            <input type="number" min="0" className={adminInput} value={form.stockQuantity} onChange={(e) => set('stockQuantity', Number(e.target.value))} />
          </Labeled>
          <Labeled label="Low-stock threshold">
            <input type="number" min="0" className={adminInput} value={form.lowStockThreshold ?? 5} onChange={(e) => set('lowStockThreshold', Number(e.target.value))} />
          </Labeled>
          <div className="flex flex-col justify-end gap-1.5 font-sans text-sm">
            {(['isActive', 'isFeatured', 'isBestSeller'] as const).map((flag) => (
              <label key={flag} className="flex items-center gap-2 text-charcoal-light">
                <input type="checkbox" checked={Boolean(form[flag])} onChange={(e) => set(flag, e.target.checked)} />
                {flag === 'isActive' ? 'Active' : flag === 'isFeatured' ? 'Featured' : 'Best seller'}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-base text-forest-900">Categories</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleInArray('categorySlugs', c.slug)}
                className={cn(
                  'rounded-full border px-3 py-1 font-sans text-xs',
                  form.categorySlugs.includes(c.slug)
                    ? 'border-forest-800 bg-forest-800 text-cream-50'
                    : 'border-cream-300 text-charcoal-light',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <h3 className="mt-6 font-display text-base text-forest-900">Ingredients</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => toggleInArray('ingredientSlugs', i.slug)}
                className={cn(
                  'rounded-full border px-3 py-1 font-sans text-xs',
                  form.ingredientSlugs.includes(i.slug)
                    ? 'border-forest-800 bg-forest-800 text-cream-50'
                    : 'border-cream-300 text-charcoal-light',
                )}
              >
                {i.name}
              </button>
            ))}
          </div>
        </Card>

        <RepeatableSection
          title="Benefits"
          items={form.benefits}
          onAdd={() => set('benefits', [...form.benefits, { title: '', description: '', icon: '', sortOrder: form.benefits.length }])}
          onRemove={(i) => set('benefits', form.benefits.filter((_, x) => x !== i))}
          render={(b, i) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={adminInput} placeholder="Title" value={b.title} onChange={(e) => set('benefits', form.benefits.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} />
              <input className={adminInput} placeholder="Icon (leaf, droplet…)" value={b.icon} onChange={(e) => set('benefits', form.benefits.map((x, xi) => (xi === i ? { ...x, icon: e.target.value } : x)))} />
              <input className={cn(adminInput, 'sm:col-span-2')} placeholder="Description" value={b.description} onChange={(e) => set('benefits', form.benefits.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)))} />
            </div>
          )}
        />

        <RepeatableSection
          title="How to use"
          items={form.usageSteps}
          onAdd={() => set('usageSteps', [...form.usageSteps, { stepNumber: form.usageSteps.length + 1, title: '', description: '' }])}
          onRemove={(i) => set('usageSteps', form.usageSteps.filter((_, x) => x !== i))}
          render={(s, i) => (
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <input className={adminInput} placeholder="Title" value={s.title} onChange={(e) => set('usageSteps', form.usageSteps.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} />
              <input className={adminInput} placeholder="Description" value={s.description} onChange={(e) => set('usageSteps', form.usageSteps.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)))} />
            </div>
          )}
        />

        <RepeatableSection
          title="Images"
          hint="Use a render key (e.g. signature-front, repair-detail) or a full image URL."
          items={form.images}
          onAdd={() => set('images', [...form.images, { imageUrl: '', altText: '', sortOrder: form.images.length, isPrimary: form.images.length === 0 }])}
          onRemove={(i) => set('images', form.images.filter((_, x) => x !== i))}
          render={(im, i) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input className={adminInput} placeholder="Key or URL" value={im.imageUrl} onChange={(e) => set('images', form.images.map((x, xi) => (xi === i ? { ...x, imageUrl: e.target.value } : x)))} />
              <input className={adminInput} placeholder="Alt text" value={im.altText} onChange={(e) => set('images', form.images.map((x, xi) => (xi === i ? { ...x, altText: e.target.value } : x)))} />
              <label className="flex items-center gap-1.5 font-sans text-xs text-charcoal-light">
                <input
                  type="radio"
                  name="primaryImage"
                  checked={im.isPrimary}
                  onChange={() => set('images', form.images.map((x, xi) => ({ ...x, isPrimary: xi === i })))}
                />
                Primary
              </label>
            </div>
          )}
        />
      </div>

      <div className="mt-8 flex gap-2">
        <Button as="button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save product'}
        </Button>
        <Button as="button" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function RepeatableSection<T>({
  title,
  hint,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  hint?: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base text-forest-900">{title}</h3>
        <button type="button" onClick={onAdd} className="font-sans text-xs font-medium text-forest-800 underline">
          + Add
        </button>
      </div>
      {hint && <p className="mt-1 font-sans text-xs text-charcoal-muted">{hint}</p>}
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="font-sans text-sm text-charcoal-muted">None yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md border border-cream-200 p-3">
            <div className="flex-1">{render(item, i)}</div>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="mt-1 p-1 text-charcoal-muted hover:text-red-500"
              aria-label="Remove"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
