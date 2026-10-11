const API_BASE = import.meta.env.VITE_API_BASE || 'https://vault67.ru/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('vault67.token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('vault67.token');
    window.dispatchEvent(new Event('vault67:unauthorized'));
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, callsign?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, callsign }) }),
  me: () => request('/auth/me'),
  updateMe: (data: any) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  products: (params?: Record<string, string|number|boolean|null>) => {
    const q = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => v != null && q.append(k, String(v)));
    return request(`/products${q.toString() ? `?${q.toString()}` : ''}`);
  },
  product: (id: string|number) => request(`/products/${id}`),
  createProduct: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string|number, data: any) =>
    request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: string|number) => request(`/products/${id}`, { method: 'DELETE' }),
  categories: () => request('/categories'),
  franchises: () => request('/franchises'),

  createOrder: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  myOrders: () => request('/orders/my'),
  allOrders: (status?: string) => request(`/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id: number, data: any) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  geoSearch: (q: string) => request(`/geo/search?q=${encodeURIComponent(q)}`),

  settings: () => request('/settings'),
  updateSettings: (data: any) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  upload: async (file: File) => {
    const token = localStorage.getItem('vault67.token');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json();
  },
};
