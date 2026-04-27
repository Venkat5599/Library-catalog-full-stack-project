import axios from 'axios';

const API = axios.create({ 
  baseURL: process.env.NODE_ENV === 'production' ? 'http://localhost:5000/api' : '/api' 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Books
export const booksAPI = {
  getAll: (params) => API.get('/books', { params }),
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id) => API.delete(`/books/${id}`),
  getFeatured: () => API.get('/books/featured'),
  getPopular: () => API.get('/books/popular'),
  getCategories: () => API.get('/books/categories'),
};

// Borrows
export const borrowsAPI = {
  borrow: (bookId, borrowingDays = 14) => API.post('/borrows', { bookId, borrowingDays }),
  return: (borrowId, body = {}) => API.put(`/borrows/return/${borrowId}`, body),
  renew: (borrowId, renewalDays = 14) => API.put(`/borrows/renew/${borrowId}`, { renewalDays }),
  getMyBorrows: (params) => API.get('/borrows/my-borrows', { params }),
  getAll: (params) => API.get('/borrows', { params }),
  payFine: (borrowId) => API.put(`/borrows/fine/${borrowId}/pay`),
};

// Users
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  toggleStatus: (id) => API.patch(`/users/${id}/toggle-status`),
};

// Dashboard
export const dashboardAPI = {
  getAdminStats: () => API.get('/dashboard/admin'),
  getUserStats: () => API.get('/dashboard/user'),
};

// Reviews
export const reviewsAPI = {
  add: (data) => API.post('/reviews', data),
  getByBook: (bookId) => API.get(`/reviews/book/${bookId}`),
  delete: (id) => API.delete(`/reviews/${id}`),
};

export default API;
