/**
 * Central API client. Every network call in the app goes through here so
 * auth, token refresh, error shaping and the response envelope live in one place.
 */

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000/api';

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  errors: ApiFieldError[];

  constructor(message: string, status: number, errors: ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** Map of field -> message for form display. */
  get fieldErrors(): Record<string, string> {
    return this.errors.reduce<Record<string, string>>((acc, e) => {
      if (e.field) acc[e.field] = e.message;
      return acc;
    }, {});
  }
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: ApiFieldError[];
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Access-token store (in memory; refresh token is an httpOnly cookie) ──

let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  listeners.forEach((l) => l(token));
};
export const getAccessToken = () => accessToken;
export const onAuthChange = (fn: (token: string | null) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

// ── Core request ──

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Skip the automatic refresh-and-retry (used by the refresh call itself). */
  skipRefresh?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(API_BASE + path, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return false;
        const json = (await res.json()) as Envelope<{ accessToken: string }>;
        if (json.success && json.data?.accessToken) {
          setAccessToken(json.data.accessToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        // allow a new refresh next time
        setTimeout(() => (refreshInFlight = null), 0);
      }
    })();
  }
  return refreshInFlight;
}

async function raw<T>(path: string, options: RequestOptions): Promise<Envelope<T>> {
  const { method = 'GET', body, query, skipRefresh, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    // Connection refused / DNS / offline — the API server is unreachable.
    throw new ApiError(
      `Can't reach the API server at ${API_BASE}. Is the backend running?`,
      0,
    );
  }

  if (res.status === 401 && !skipRefresh && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) return raw<T>(path, { ...options, skipRefresh: true });
  }

  let json: Envelope<T>;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(res.statusText || 'Network error', res.status);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(json?.message || 'Request failed', res.status, json?.errors ?? []);
  }
  return json;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const json = await raw<T>(path, options);
  return json.data;
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta: PageMeta | undefined }> {
  const json = await raw<T>(path, options);
  return { data: json.data, meta: json.meta as PageMeta | undefined };
}

export const api = {
  get: <T>(path: string, query?: Record<string, QueryValue>, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'GET', query, signal }),
  getWithMeta: <T>(path: string, query?: Record<string, QueryValue>, signal?: AbortSignal) =>
    apiRequestWithMeta<T>(path, { method: 'GET', query, signal }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'DELETE', body }),
};
