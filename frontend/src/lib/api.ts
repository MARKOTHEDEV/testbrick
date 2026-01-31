const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiRequest('/health');
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export async function getCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequest('/auth/me', { token });
}

// Projects API
export interface Project {
  id: string;
  name: string;
  description: string | null;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    folders: number;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  baseUrl: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  baseUrl?: string;
}
