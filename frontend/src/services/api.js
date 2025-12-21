// frontend/src/services/api.js
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
  getItems: async () => {
    const response = await API.get('/items');
    return response.data;
  },

  getItem: async (id) => {
    const response = await API.get(`/items/${id}`);
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await API.post('/items', itemData);
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await API.put(`/items/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await API.delete(`/items/${id}`);
    return response.data;
  },
};

export const suppliersAPI = {
  getSuppliers: async () => {
    const response = await API.get('/suppliers');
    return response.data;
  },

  createSupplier: async (data) => {
    const response = await API.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await API.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await API.delete(`/suppliers/${id}`);
    return response.data;
  },
};

export const ordersAPI = {
  getPurchaseOrders: async () => {
    const response = await API.get('/purchase-orders');
    return response.data;
  },

  createPurchaseOrder: async (data) => {
    const response = await API.post('/purchase-orders', data);
    return response.data;
  },

  updatePurchaseOrder: async (id, data) => {
    const response = await API.put(`/purchase-orders/${id}`, data);
    return response.data;
  },
};

export const reportsAPI = {
  getEmissionsByItem: async () => {
    const response = await API.get('/reports/emissions-by-item');
    return response.data;
  },

  getEmissionsBySupplier: async () => {
    const response = await API.get('/reports/emissions-by-supplier');
    return response.data;
  },
};

export default API;
