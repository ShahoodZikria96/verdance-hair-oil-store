import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin';
import type { AdminAnalytics, AdminDashboard } from '../../types/api';
import { formatPrice, cn } from '../../lib/format';
import { Badge, Card, PageHeader, Spinner, StatCard } from '../../components/admin/AdminUI';

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.dashboard(), adminService.analytics(30)])
      .then(([d, a]) => {
        setData(d);
        setAnalytics(a);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (!data) return <p className="font-sans text-sm text-red-500">Could not load the dashboard.</p>;

  const maxRevenue = Math.max(1, ...(analytics?.salesByDate.map((d) => d.revenue) ?? [1]));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Store performance at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatPrice(data.totalRevenue)} icon="sparkle" />
        <StatCard label="Orders" value={data.totalOrders} icon="bag" hint={`${data.pendingOrders} pending`} />
        <StatCard label="Customers" value={data.totalCustomers} icon="user" />
        <StatCard
          label="Low stock"
          value={data.lowStockCount}
          icon="droplet"
          tone={data.lowStockCount > 0 ? 'warn' : 'default'}
          hint={`${data.totalProducts} active products`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest-900">Revenue — last 30 days</h2>
            <span className="font-sans text-sm text-charcoal-light">
              {formatPrice(analytics?.revenueSummary.total ?? 0)} ·{' '}
              {analytics?.revenueSummary.orderCount ?? 0} orders
            </span>
          </div>
          {analytics && analytics.salesByDate.length > 0 ? (
            <div className="mt-6 flex h-40 items-end gap-1">
              {analytics.salesByDate.map((d) => (
                <div key={d.date} className="group relative flex-1">
                  <div
                    className="rounded-t bg-forest-300 transition-colors group-hover:bg-forest-700"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 2 }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-charcoal px-2 py-1 font-sans text-[10px] text-cream-50 opacity-0 transition-opacity group-hover:opacity-100">
                    {d.date} · {formatPrice(d.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 font-sans text-sm text-charcoal-muted">No paid orders in this period yet.</p>
          )}
          <p className="mt-3 font-sans text-xs text-charcoal-muted">
            Avg order value {formatPrice(analytics?.revenueSummary.averageOrderValue ?? 0)}
          </p>
        </Card>

        {/* Orders by status */}
        <Card className="p-6">
          <h2 className="font-display text-lg text-forest-900">Orders by status</h2>
          <ul className="mt-4 space-y-2">
            {(analytics?.ordersByStatus ?? []).map((s) => (
              <li key={s.status} className="flex items-center justify-between font-sans text-sm">
                <Badge>{s.status}</Badge>
                <span className="tabular-nums text-charcoal">{s.count}</span>
              </li>
            ))}
            {(!analytics || analytics.ordersByStatus.length === 0) && (
              <li className="font-sans text-sm text-charcoal-muted">No orders yet.</li>
            )}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
            <h2 className="font-display text-lg text-forest-900">Recent orders</h2>
            <Link to="/admin/orders" className="font-sans text-xs font-medium text-forest-800 underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-cream-100">
            {data.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 font-sans text-sm">
                <div>
                  <Link to={`/admin/orders?id=${o.id}`} className="font-medium text-charcoal hover:text-forest-800">
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-charcoal-muted">{o.customerEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{o.status}</Badge>
                  <span className="tabular-nums text-charcoal">{formatPrice(o.total, o.currency)}</span>
                </div>
              </li>
            ))}
            {data.recentOrders.length === 0 && (
              <li className="px-5 py-6 font-sans text-sm text-charcoal-muted">No orders yet.</li>
            )}
          </ul>
        </Card>

        {/* Best sellers + low stock */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-cream-200 px-5 py-4">
              <h2 className="font-display text-lg text-forest-900">Best sellers (30d)</h2>
            </div>
            <ul className="divide-y divide-cream-100">
              {(analytics?.bestSellingProducts ?? []).map((p) => (
                <li
                  key={p.productId ?? p.productName}
                  className="flex items-center justify-between px-5 py-3 font-sans text-sm"
                >
                  <span className="text-charcoal">{p.productName}</span>
                  <span className="text-charcoal-muted">
                    {p.unitsSold} sold · {formatPrice(p.revenue)}
                  </span>
                </li>
              ))}
              {(!analytics || analytics.bestSellingProducts.length === 0) && (
                <li className="px-5 py-6 font-sans text-sm text-charcoal-muted">No sales yet.</li>
              )}
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-cream-200 px-5 py-4">
              <h2 className="font-display text-lg text-forest-900">Low stock</h2>
            </div>
            <ul className="divide-y divide-cream-100">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 font-sans text-sm">
                  <span className="text-charcoal">
                    {p.name} <span className="text-charcoal-muted">({p.sku})</span>
                  </span>
                  <span
                    className={cn(
                      'tabular-nums font-medium',
                      p.stockQuantity === 0 ? 'text-red-600' : 'text-gold-dark',
                    )}
                  >
                    {p.stockQuantity} left
                  </span>
                </li>
              ))}
              {data.lowStockProducts.length === 0 && (
                <li className="px-5 py-6 font-sans text-sm text-charcoal-muted">
                  Everything is well stocked.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
