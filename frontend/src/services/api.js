import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Request interceptor for adding JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify2FA: (otp, tempToken) => api.post('/auth/2fa/verify', { otp, tempToken }),
  signup: (email, password, name, phone) => api.post('/auth/signup', { email, password, name, phone }),
};

export const bookApi = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
};

export const orderApi = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payment/create-order', data),
};

export const adminApi = {
  getAllOrders: () => api.get('/admin/orders'),
  exportCSV: () => api.get('/admin/export/csv', { responseType: 'blob' }),
};

export default api;
