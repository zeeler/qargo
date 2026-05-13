const BASE_URL = '/api';

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(BASE_URL + url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const http = {
  get: (url: string): Promise<any> => request(url),
  post: (url: string, body?: any): Promise<any> => request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (url: string, body?: any): Promise<any> => request(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (url: string): Promise<any> => request(url, { method: 'DELETE' }),
};
