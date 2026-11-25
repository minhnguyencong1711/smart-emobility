const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

export const TOKEN_STORAGE_KEY = 'emobility_access_token';
export const EMAIL_STORAGE_KEY = 'emobility_auth_email';

export class ApiNetworkError extends Error {
  constructor(message = 'Backend service is unreachable.') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

export class ApiHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiNetworkError();
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    // Vite returns 502/504 when backend server is stopped locally
    if (response.status >= 502) {
      throw new ApiNetworkError('Backend proxy returned gateway error.');
    }
    const msg =
      (payload as { message?: string } | null)?.message ??
      `HTTP ${response.status}`;
    throw new ApiHttpError(response.status, msg);
  }

  return payload as T;
}
