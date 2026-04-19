import axios from 'axios';

const API = axios.create({
  baseURL: 'https://intellicart-k87v.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/profile';
    }
    return Promise.reject(error);
  }
);

export const registerUser   = (name, email, password) => API.post('/api/auth/register', { name, email, password });
export const loginUser      = (email, password) => API.post('/api/auth/login', { email, password });
export const getCurrentUser = () => API.get('/api/auth/me');

export const getAllProducts  = (category = null, search = null) => {
  const params = {};
  if (category) params.category = category;
  if (search)   params.search   = search;
  return API.get('/api/products/', { params });
};
export const getCategories   = () => API.get('/api/products/categories');

export const placeOrder      = (cartItems, totalAmount) => API.post('/api/orders/', {
  items: cartItems.map(item => ({ product_id: item.id, quantity: 1, unit_price: item.price })),
  total_amount: totalAmount,
});
export const getOrderHistory = () => API.get('/api/orders/');

export const createSchedule      = (product_id, quantity, frequency, next_order_date) =>
  API.post('/api/scheduled/', { product_id, quantity, frequency, next_order_date });
export const getSchedules        = () => API.get('/api/scheduled/');
export const updateScheduleStatus = (id, status) => API.patch(`/api/scheduled/${id}`, { status });
export const getSmartSuggestions = () => API.get('/api/scheduled/suggestions');
export const getRecommendations  = () => API.get('/api/recommendations/');