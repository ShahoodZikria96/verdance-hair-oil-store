import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import type { AdminReview } from '../../types/api';
import { cn } from '../../lib/format';
import { Rating } from '../../components/ui/Rating';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
} from '../../components/admin/AdminUI';

const tabs = [
  { key: 'false', label: 'Pending' },
  { key: 'true', label: 'Approved' },
  { key: '', label: 'All' },
] as const;

export function AdminReviewsPage() {
  const [tab, setTab] = useState<'false' | 'true' | ''>('false');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .reviews({ approved: tab || undefined, page })
      .then((res) => {
        setReviews(res.data);
        setTotalPages(res.meta.totalPages);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setBusyId(id);
    try {
      if (action === 'approve') await adminService.approveReview(id);
      else if (action === 'reject') await adminService.rejectReview(id);
      else await adminService.deleteReview(id);
      setReviews((list) =>
        action === 'delete'
          ? list.filter((r) => r.id !== id)
          : list.map((r) => (r.id === id ? { ...r, approved: action === 'approve' } : r)),
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Approve, unpublish or delete customer reviews." />

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
        <Spinner label="Loading reviews…" />
      ) : reviews.length === 0 ? (
        <EmptyState>No reviews here.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Rating value={r.rating} size="sm" />
                    <Badge>{r.approved ? 'approved' : 'pending'}</Badge>
                    {r.verified && <Badge>verified</Badge>}
                  </div>
                  {r.title && <p className="mt-1.5 font-sans text-sm font-semibold text-charcoal">{r.title}</p>}
                  <p className="mt-1 font-sans text-sm text-charcoal-light">{r.body}</p>
                  <p className="mt-2 font-sans text-xs text-charcoal-muted">
                    {r.author}
                    {r.product ? ` · ${r.product.name}` : ''} ·{' '}
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 font-sans text-xs font-medium">
                  {!r.approved ? (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void act(r.id, 'approve')}
                      className="rounded-md bg-forest-800 px-3 py-1.5 text-cream-50 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void act(r.id, 'reject')}
                      className="rounded-md border border-cream-300 px-3 py-1.5 text-charcoal-light disabled:opacity-50"
                    >
                      Unpublish
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => void act(r.id, 'delete')}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-red-500 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
