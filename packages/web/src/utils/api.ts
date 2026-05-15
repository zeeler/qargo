import { http } from './http';

export const authApi = {
  sendCode: (phone: string) => http.post('/auth/send-code', { phone }),
  register: (data: any) => http.post('/auth/register', data),
  login: (data: any) => http.post('/auth/login', data),
};

export const userApi = {
  getProfile: () => http.get('/user/profile'),
  updateProfile: (data: any) => http.put('/user/profile', data),
  getAddresses: () => http.get('/user/addresses'),
  createAddress: (data: any) => http.post('/user/addresses', data),
  deleteAddress: (id: string) => http.delete(`/user/addresses/${id}`),
};

export const vehicleApi = {
  getTypes: () => http.get('/vehicle/types'),
  getPricing: () => http.get('/vehicle/pricing'),
  calculatePrice: (data: any) => http.post('/vehicle/price', data),
};

export const orderApi = {
  create: (data: any) => http.post('/order/create', data),
  getList: () => http.get('/order/list'),
  getDetail: (id: string) => http.get(`/order/${id}`),
  pay: (id: string) => http.put(`/order/${id}/pay`),
  cancel: (id: string) => http.put(`/order/${id}/cancel`),
  getNearby: (data: any) => http.post('/order/nearby', data),
  dispatch: (id: string) => http.put(`/order/${id}/dispatch`),
};

export const reviewApi = {
  create: (data: any) => http.post('/review', data),
  getByOrder: (orderId: string) => http.get(`/review/order/${orderId}`),
};

export const complaintApi = {
  create: (data: any) => http.post('/complaint', data),
  getMy: () => http.get('/complaint/my'),
};

export const driverApi = {
  register: (data: any) => http.post('/driver/register', data),
  getStatus: () => http.get('/driver/status'),
  updateLocation: (data: any) => http.put('/driver/location', data),
  getOrders: () => http.get('/order/driver/list'),
  arrive: (id: string) => http.put(`/order/${id}/arrive`),
  depart: (id: string) => http.put(`/order/${id}/depart`),
  uploadPhoto: (id: string, photoUrl: string) => http.put(`/order/${id}/photo`, { photoUrl }),
  complete: (id: string) => http.put(`/order/${id}/complete`),
};
