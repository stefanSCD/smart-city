// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Configurează axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adaugă token la toate cererile
api.interceptors.request.use(request => {
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

// Funcții pentru autentificare
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login/user', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Verifică dacă utilizatorul este autentificat
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Expune API pentru a fi folosit în alte servicii
export { api };