import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import type { AdminCustomer } from '../../types/api';
import { cn } from '../../lib/format';
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

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .customers({ search: search || undefined, page })
      .then((res) => {
        setCustomers(res.data);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (c: AdminCustomer) => {
    setBusyId(c.id);
    try {
      const res = await adminService.setCustomerActive(c.id, !c.isActive);
      setCustomers((list) => list.map((x) => (x.id === c.id ? { ...x, isActive: res.isActive } : x)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Customers" subtitle="Everyone who has registered an account." />

      <Card className="mb-5 p-4">
        <div className="relative max-w-sm">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Name or email"
            className={cn(adminInput, 'pl-9')}
          />
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading customers…" />
      ) : customers.length === 0 ? (
        <EmptyState>No customers found.</EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left font-sans text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-charcoal-muted">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Reviews</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-charcoal">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-charcoal-muted">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                  </td>
                  <td className="px-5 py-3 text-charcoal-light">
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-charcoal">{c._count.orders}</td>
                  <td className="px-5 py-3 tabular-nums text-charcoal">{c._count.reviews}</td>
                  <td className="px-5 py-3"><Badge>{c.isActive ? 'active' : 'inactive'}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => void toggle(c)}
                      className="font-sans text-xs font-medium text-forest-800 underline disabled:opacity-50"
                    >
                      {c.isActive ? 'Deactivate' : 'Reactivate'}
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
