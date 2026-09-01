import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin';
import type { ApiOrder } from '../../types/api';
import { formatPrice, cn } from '../../lib/format';
import { Icon } from '../../components/ui/Icon';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
  adminInput,
} from '../../components/admin/AdminUI';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export function AdminOrdersPage() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .orders({ status: status || undefined, paymentStatus: paymentStatus || undefined, search: search || undefined, page })
      .then((res) => {
        setOrders(res.data);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [status, paymentStatus, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep link ?id=
  useEffect(() => {
    const id = params.get('id');
    if (id && (!selected || selected.id !== id)) {
      adminService.order(id).then(setSelected).catch(() => undefined);
    }
    if (!id) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const open = (o: ApiOrder) => {
    setSelected(o);
    setParams((p) => {
      p.set('id', o.id);
      return p;
    });
  };
  const close = () => {
    setSelected(null);
    setParams((p) => {
      p.delete('id');
      return p;
    });
  };

  const updateStatus = async (next: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminService.setOrderStatus(selected.id, next);
      setSelected(updated);
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
    } finally {
      setSaving(false);
    }
  };
  const updatePayment = async (next: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await adminService.setPaymentStatus(selected.id, next);
      setSelected(updated);
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Review orders and update fulfilment or payment status." />

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Order number or email"
            className={cn(adminInput, 'pl-9')}
          />
        </div>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className={cn(adminInput, 'w-auto')}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => { setPage(1); setPaymentStatus(e.target.value); }} className={cn(adminInput, 'w-auto')}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Card>

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState>No orders match these filters.</EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left font-sans text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-charcoal-muted">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => open(o)}
                  className="cursor-pointer transition-colors hover:bg-cream-50"
                >
                  <td className="px-5 py-3 font-medium text-charcoal">{o.orderNumber}</td>
                  <td className="px-5 py-3 text-charcoal-light">{o.customerEmail}</td>
                  <td className="px-5 py-3 text-charcoal-light">
                    {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5">
                      <Badge>{o.paymentMethod}</Badge>
                      <Badge>{o.paymentStatus}</Badge>
                    </span>
                  </td>
                  <td className="px-5 py-3"><Badge>{o.status}</Badge></td>
                  <td className="px-5 py-3 text-right tabular-nums text-charcoal">
                    {formatPrice(o.total, o.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Detail drawer */}
      <div className={cn('fixed inset-0 z-50', selected ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-charcoal/40 transition-opacity', selected ? 'opacity-100' : 'opacity-0')}
          onClick={close}
        />
        <aside
          className={cn(
            'absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto bg-ivory shadow-lift transition-transform duration-300 ease-premium',
            selected ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          {selected && (
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl text-forest-900">{selected.orderNumber}</h2>
                  <p className="font-sans text-xs text-charcoal-muted">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <button type="button" onClick={close} className="p-2 text-forest-900" aria-label="Close">
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block font-sans text-xs font-medium text-charcoal">Order status</span>
                  <select
                    disabled={saving}
                    value={selected.status}
                    onChange={(e) => void updateStatus(e.target.value)}
                    className={adminInput}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-sans text-xs font-medium text-charcoal">Payment status</span>
                  <select
                    disabled={saving}
                    value={selected.paymentStatus}
                    onChange={(e) => void updatePayment(e.target.value)}
                    className={adminInput}
                  >
                    {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <p className="mt-2 font-sans text-xs text-charcoal-muted">
                Payment method: <Badge>{selected.paymentMethod}</Badge>
                {selected.paymentMethod === 'COD' && selected.paymentStatus !== 'PAID' && (
                  <> — marking the order “Delivered” records the cash as collected.</>
                )}
              </p>

              <div className="mt-6 rounded-lg border border-cream-200 bg-white">
                <ul className="divide-y divide-cream-100">
                  {selected.items.map((i) => (
                    <li key={i.id} className="flex justify-between px-4 py-3 font-sans text-sm">
                      <span className="text-charcoal">
                        {i.productName} <span className="text-charcoal-muted">× {i.quantity}</span>
                      </span>
                      <span className="tabular-nums text-charcoal">
                        {formatPrice(i.totalPrice, selected.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-1 border-t border-cream-200 px-4 py-3 font-sans text-sm">
                  <div className="flex justify-between text-charcoal-light">
                    <dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(selected.subtotal, selected.currency)}</dd>
                  </div>
                  {selected.discount > 0 && (
                    <div className="flex justify-between text-forest-700">
                      <dt>Discount {selected.couponCode ? `(${selected.couponCode})` : ''}</dt>
                      <dd className="tabular-nums">−{formatPrice(selected.discount, selected.currency)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-charcoal-light">
                    <dt>Shipping</dt>
                    <dd className="tabular-nums">
                      {selected.shippingFee === 0 ? 'Free' : formatPrice(selected.shippingFee, selected.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-cream-200 pt-1 font-semibold text-charcoal">
                    <dt>Total</dt><dd className="tabular-nums">{formatPrice(selected.total, selected.currency)}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 rounded-lg border border-cream-200 bg-white p-4 font-sans text-sm text-charcoal-light">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal">Ship to</p>
                <p className="mt-1.5">
                  {selected.shippingAddress.firstName} {selected.shippingAddress.lastName}
                  <br />
                  {selected.shippingAddress.addressLine1}
                  {selected.shippingAddress.addressLine2 ? `, ${selected.shippingAddress.addressLine2}` : ''}
                  <br />
                  {selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.postalCode}
                  <br />
                  {selected.shippingAddress.country}
                </p>
                <p className="mt-2 text-xs text-charcoal-muted">
                  {selected.customerEmail}
                  {selected.customerPhone ? ` · ${selected.customerPhone}` : ''}
                </p>
              </div>

              {selected.notes && (
                <p className="mt-3 rounded-md bg-cream-100 px-3 py-2 font-sans text-xs text-charcoal-light">
                  Note: {selected.notes}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
