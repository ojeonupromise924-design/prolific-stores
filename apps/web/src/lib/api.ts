import type { ApiEnvelope } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
  skipRetry?: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Registered once by the auth store at app startup — lets this
// module trigger a silent refresh without importing the store
// directly (which would create a circular import).
let refreshHandler: (() => Promise<string | null>) | null = null;
export function registerRefreshHandler(handler: () => Promise<string | null>) {
  refreshHandler = handler;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, headers, skipRetry, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401 && !skipRetry && refreshHandler) {
    const newToken = await refreshHandler();
    if (newToken) {
      return request<T>(path, { ...options, accessToken: newToken, skipRetry: true });
    }
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = body as { message?: string; error?: string } | null;
    const message = errorBody?.message ?? errorBody?.error ?? 'Something went wrong';
    throw new ApiError(message, res.status);
  }

  const envelope = body as ApiEnvelope<T>;
  return envelope.data;
}

export const api = {
  get: <T>(path: string, accessToken?: string | null, skipRetry?: boolean) =>
    request<T>(path, { method: 'GET', accessToken, skipRetry }),
  post: <T>(path: string, body?: unknown, accessToken?: string | null, skipRetry?: boolean) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, accessToken, skipRetry }),
  patch: <T>(path: string, body?: unknown, accessToken?: string | null, skipRetry?: boolean) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, accessToken, skipRetry }),
  delete: <T>(path: string, accessToken?: string | null, skipRetry?: boolean) =>
    request<T>(path, { method: 'DELETE', accessToken, skipRetry }),
};

export async function uploadFile<T>(path: string, file: File, accessToken: string | null): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const errorBody = body as { message?: string; error?: string } | null;
    throw new ApiError(errorBody?.message ?? errorBody?.error ?? 'Upload failed', res.status);
  }
  const envelope = body as ApiEnvelope<T>;
  return envelope.data;
}