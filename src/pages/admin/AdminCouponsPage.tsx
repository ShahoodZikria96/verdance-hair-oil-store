import { useEffect, useState } from 'react';
import { adminService, type CouponInput } from '../../services/admin';
import { ApiError } from '../../lib/api';
import type { AdminCoupon } from '../../types/api';
import { formatPrice, cn } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import {
  Badge,
  Card,
  EmptyState,
  Labeled,
  PageHeader,
  Spinner,
  adminInput,
} from '../../components/admin/AdminUI';

const blank: CouponInput = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minimumOrderAmount: null,
  maximumDiscount: null,
  usageLimit: null,
  startsAt: null,
  expiresAt: null,
  isActive: true,
};

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () =>
    adminService
      .coupons()
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const deactivate = async (id: string) => {
    await adminService.deleteCoupon(id);
    void load();
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Discount codes applied at checkout (validated server-side)."
        action={
          <Button as="button" onClick={() => { setCreating(true); setEditing(null); }}>
            <Icon name="plus" className="h-4 w-4" />
            New coupon
          </Button>
        }
      />

      {(creating || editing) && (
        <CouponForm
          initial={editing ?? blank}
          id={editing?.id}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); void load(); }}
        />
      )}

      {loading ? (
        <Spinner label="Loading coupons…" />
      ) : coupons.length === 0 ? (
        <EmptyState>No coupons yet.</EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left font-sans text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-charcoal-muted">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Rules</th>
                <th className="px-5 py-3">Used</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-charcoal">{c.code}</p>
                    {c.description && <p className="text-xs text-charcoal-muted">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-charcoal">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                  </td>
                  <td className="px-5 py-3 text-xs text-charcoal-light">
                    {c.minimumOrderAmount ? `min ${formatPrice(c.minimumOrderAmount)}` : 'no minimum'}
                    {c.maximumDiscount ? ` · cap ${formatPrice(c.maximumDiscount)}` : ''}
                    {c.expiresAt ? ` · ends ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-charcoal">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-5 py-3"><Badge>{c.isActive ? 'active' : 'inactive'}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3 font-sans text-xs font-medium">
                      <button type="button" onClick={() => { setEditing(c); setCreating(false); }} className="text-forest-800 underline">
                        Edit
                      </button>
                      {c.isActive && (
                        <button type="button" onClick={() => void deactivate(c.id)} className="text-red-500 underline">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function CouponForm({
  initial,
  id,
  onCancel,
  onSaved,
}: {
  initial: AdminCoupon | CouponInput;
  id?: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CouponInput>({
    code: initial.code,
    description: initial.description ?? '',
    discountType: initial.discountType,
    discountValue: initial.discountValue,
    minimumOrderAmount: initial.minimumOrderAmount ?? null,
    maximumDiscount: initial.maximumDiscount ?? null,
    usageLimit: initial.usageLimit ?? null,
    startsAt: initial.startsAt ? String(initial.startsAt).slice(0, 10) : null,
    expiresAt: initial.expiresAt ? String(initial.expiresAt).slice(0, 10) : null,
    isActive: initial.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof CouponInput>(k: K, v: CouponInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload: CouponInput = {
      ...form,
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      minimumOrderAmount: form.minimumOrderAmount || null,
      maximumDiscount: form.maximumDiscount || null,
      usageLimit: form.usageLimit || null,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    };
    try {
      if (id) await adminService.updateCoupon(id, payload);
      else await adminService.createCoupon(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the coupon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6 p-6">
      <form onSubmit={submit} className="space-y-4">
        <h3 className="font-display text-lg text-forest-900">{id ? 'Edit coupon' : 'New coupon'}</h3>
        {error && <p className="font-sans text-sm text-red-500">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Code">
            <input className={adminInput} value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} required disabled={!!id} />
          </Labeled>
          <Labeled label="Description">
            <input className={adminInput} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </Labeled>
          <Labeled label="Type">
            <select className={adminInput} value={form.discountType} onChange={(e) => set('discountType', e.target.value as CouponInput['discountType'])}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </select>
          </Labeled>
          <Labeled label={form.discountType === 'PERCENTAGE' ? 'Value (%)' : 'Value ($)'}>
            <input type="number" step="0.01" min="0" className={adminInput} value={form.discountValue} onChange={(e) => set('discountValue', Number(e.target.value))} required />
          </Labeled>
          <Labeled label="Minimum order ($)">
            <input type="number" step="0.01" min="0" className={adminInput} value={form.minimumOrderAmount ?? ''} onChange={(e) => set('minimumOrderAmount', e.target.value ? Number(e.target.value) : null)} />
          </Labeled>
          <Labeled label="Maximum discount ($)">
            <input type="number" step="0.01" min="0" className={adminInput} value={form.maximumDiscount ?? ''} onChange={(e) => set('maximumDiscount', e.target.value ? Number(e.target.value) : null)} />
          </Labeled>
          <Labeled label="Usage limit">
            <input type="number" min="1" className={adminInput} value={form.usageLimit ?? ''} onChange={(e) => set('usageLimit', e.target.value ? Number(e.target.value) : null)} />
          </Labeled>
          <div className="flex items-end">
            <label className="flex items-center gap-2 font-sans text-sm text-charcoal-light">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Active
            </label>
          </div>
          <Labeled label="Starts at">
            <input type="date" className={adminInput} value={form.startsAt ?? ''} onChange={(e) => set('startsAt', e.target.value || null)} />
          </Labeled>
          <Labeled label="Expires at">
            <input type="date" className={adminInput} value={form.expiresAt ?? ''} onChange={(e) => set('expiresAt', e.target.value || null)} />
          </Labeled>
        </div>
        <div className={cn('flex gap-2')}>
          <Button as="button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save coupon'}</Button>
          <Button as="button" type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
