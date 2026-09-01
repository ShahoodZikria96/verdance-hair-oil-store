import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import type { NewsletterSubscriber } from '../../types/api';
import { cn } from '../../lib/format';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
} from '../../components/admin/AdminUI';

const tabs = [
  { key: 'true', label: 'Subscribed' },
  { key: 'false', label: 'Unsubscribed' },
  { key: '', label: 'All' },
] as const;

export function AdminNewsletterPage() {
  const [tab, setTab] = useState<'true' | 'false' | ''>('true');
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .newsletter({ subscribed: tab || undefined, page })
      .then((res) => {
        setRows(res.data);
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="Newsletter" subtitle={`${total} subscriber${total === 1 ? '' : 's'}.`} />

      <div className="mb-5 flex gap-1 border-b border-cream-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setPage(1); }}
            className={cn(
              'relative px-4 py-2.5 font-sans text-sm font-medium transition-colors',
              tab === t.key ? 'text-forest-900' : 'text-charcoal-muted hover:text-charcoal',
            )}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest-800" />}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading subscribers…" />
      ) : rows.length === 0 ? (
        <EmptyState>No subscribers here yet.</EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left font-sans text-sm">
            <thead className="border-b border-cream-200 text-xs uppercase tracking-wide text-charcoal-muted">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-cream-50">
                  <td className="px-5 py-3 text-charcoal">{s.email}</td>
                  <td className="px-5 py-3"><Badge>{s.isSubscribed ? 'active' : 'inactive'}</Badge></td>
                  <td className="px-5 py-3 text-charcoal-light">
                    {s.subscribedAt
                      ? new Date(s.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
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
