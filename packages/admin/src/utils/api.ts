import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  },
);

export default api;

// Auth
export const authApi = {
  login: (phone: string, code: string) => api.post('/auth/login', { phone, code }),
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
};

// Vehicle (for pricing)
export const vehicleApi = {
  getPricing: () => api.get('/vehicle/pricing'),
};

// Admin
export const adminApi = {
  getAllDrivers: () => api.get('/admin/drivers'),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  reviewDriver: (id: string, action: 'approve' | 'reject', remark?: string) =>
    api.put(`/admin/drivers/${id}/review`, { action, remark }),
  getOrders: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/orders', { params }),
  cancelOrder: (id: string) => api.put(`/admin/orders/${id}/cancel`),
  completeOrder: (id: string) => api.put(`/admin/orders/${id}/complete`),
  getDashboard: () => api.get('/admin/statistics/dashboard'),
  getComplaints: () => api.get('/admin/complaints'),
  resolveComplaint: (id: string, resolution: string) =>
    api.put(`/admin/complaints/${id}/resolve`, { resolution }),
  dismissComplaint: (id: string, resolution?: string) =>
    api.put(`/admin/complaints/${id}/dismiss`, { resolution }),
  getPricingRules: () => api.get('/admin/pricing'),
  updatePricing: (id: string, data: { basePrice?: number; pricePerKm?: number; includedKm?: number }) =>
    api.put(`/admin/pricing/${id}`, data),
};
