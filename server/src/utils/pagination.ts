export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function resolvePagination(
  rawPage?: unknown,
  rawLimit?: unknown,
  maxLimit = 60,
): PageParams {
  let page = Number(rawPage);
  let limit = Number(rawLimit);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 12;
  limit = Math.min(limit, maxLimit);
  page = Math.floor(page);
  limit = Math.floor(limit);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPageMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
