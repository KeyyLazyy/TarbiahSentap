import axios from 'axios';

const isDev = import.meta.env.DEV;

// Client for Express backend (books, orders, admin)
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Client for Laravel backend (auth)
const authClient = axios.create({
  baseURL: '/api',
});

// Request interceptor for adding JWT
const addTokenInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        config.headers['X-User-Id'] = user.id;
        config.headers['X-User-Role'] = user.role;
      }
    } catch (e) {}
  }
  return config;
};

api.interceptors.request.use(addTokenInterceptor);
authClient.interceptors.request.use(addTokenInterceptor);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify2FA: (otp, userId, tempToken) => api.post('/auth/2fa/verify', { otp, tempToken }),
  signup: (email, password, name, phone) => api.post('/auth/signup', { email, password, name, phone }),
  verifyDevice: (email, code) => api.post('/auth/verify-device', { email, verification_code: code }),
  updateProfile: (profileData) => api.post('/profile', profileData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const bookApi = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  update: (id, data) => api.put(`/books/${id}`, data),
  create: (data) => api.post('/books', data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const orderApi = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
};

export const adminApi = {
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  exportCSV: () => api.get('/admin/export/csv', { responseType: 'blob' }),
  getStripeRevenue: () => api.get('/admin/stripe-revenue'),
  getStripeOverview: () => api.get('/admin/stripe-overview'),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payment/create-order', data),
};

export default api;
