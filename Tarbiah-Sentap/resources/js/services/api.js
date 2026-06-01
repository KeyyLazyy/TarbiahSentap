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
  return config;
};

api.interceptors.request.use(addTokenInterceptor);
authClient.interceptors.request.use(addTokenInterceptor);

export const authApi = {
  login: (email, password) => authClient.post('/auth/login', { email, password }),
  verify2FA: (otp, userId) => authClient.post('/auth/verify-totp', { totp_code: otp, user_id: userId }),
  signup: (email, password, name, phone) => authClient.post('/auth/register', { email, password, name, phone }),
  verifyDevice: (email, code) => authClient.post('/auth/verify-device', { email, verification_code: code }),
};

export const bookApi = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
};

export const orderApi = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
};

export const adminApi = {
  getAllOrders: () => api.get('/admin/orders'),
  exportCSV: () => api.get('/admin/export/csv', { responseType: 'blob' }),
};

export default api;
