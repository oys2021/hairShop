const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5090/api/v1';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.message ?? 'Request failed', response.status);
  }

  return payload;
}

export function getApiData(path) {
  return apiFetch(path).then((payload) => payload.data);
}

export function getApiPage(path) {
  return apiFetch(path).then((payload) => ({
    data: payload.data ?? [],
    meta: payload.meta ?? null,
  }));
}
