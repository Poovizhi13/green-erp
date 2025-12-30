import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  initUsers: async () => {
    const response = await API.post('/auth/init-users');
    return response.data;
  },
  login: async (username, password) => {
    const response = await API.post('/auth/login', { username, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
    }
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
  },
  isLoggedIn: () => {
    return !!localStorage.getItem('access_token');
  },
};

export const itemsAPI = {
  getItems: async () => API.get('/items').then(r => r.data),
  getItem: async (id) => API.get(`/items/${id}`).then(r => r.data),
  createItem: async (itemData) => API.post('/items', itemData).then(r => r.data),
  updateItem: async (id, itemData) => API.put(`/items/${id}`, itemData).then(r => r.data),
  deleteItem: async (id) => API.delete(`/items/${id}`).then(r => r.data),
};

export const suppliersAPI = {
  getSuppliers: async () => API.get('/suppliers').then(r => r.data),
  createSupplier: async (data) => API.post('/suppliers', data).then(r => r.data),
  updateSupplier: async (id, data) => API.put(`/suppliers/${id}`, data).then(r => r.data),
  deleteSupplier: async (id) => API.delete(`/suppliers/${id}`).then(r => r.data),
};

export const ordersAPI = {
  getPurchaseOrders: async () => API.get('/purchase-orders').then(r => r.data),
  createPurchaseOrder: async (data) => API.post('/purchase-orders', data).then(r => r.data),
  updatePurchaseOrder: async (id, data) => API.put(`/purchase-orders/${id}`, data).then(r => r.data),
};

export const reportsAPI = {
  getEmissionsByItem: async () => API.get('/reports/emissions-by-item').then(r => r.data),
  getEmissionsBySupplier: async () => API.get('/reports/emissions-by-supplier').then(r => r.data),
  getAIRecommendations: async () => API.get('/reports/ai-recommendations').then(r => r.data),  // ✅ AI
};

export default API;
