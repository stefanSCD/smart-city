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

// Funcția login unificată
export const login = async (email, password) => {
  try {
    // Utilizăm ruta unificată pentru login
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      // Verificăm dacă utilizatorul are un ID valid (UUID)
      if (response.data.user && response.data.user.id) {
        // Verificăm dacă ID-ul este în format UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(response.data.user.id)) {
          console.warn('ID-ul utilizatorului nu este în format UUID:', response.data.user.id);
          
          // Opțional: poți face un request separat pentru a converti ID-ul
          // sau poți proceda cu ID-ul existent și lăsa backend-ul să gestioneze conversia
        }
      }
      
      // Salvăm token-ul și informațiile utilizatorului în localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Salvăm și tipul utilizatorului pentru a putea face redirecționări bazate pe rol
      if (response.data.user && response.data.user.userType) {
        localStorage.setItem('userType', response.data.user.userType);
      }
      
      return response.data;
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Ruta de înregistrare actualizată pentru a utiliza endpoint-ul unificat
export const registerUser = async (userData) => {
  try {
    // Utilizăm ruta de înregistrare pentru utilizatori
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// Funcție pentru deconectare
export const logout = async () => {
  try {
    // Încercăm să notificăm serverul (optional, dacă API-ul suportă)
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('Logout from server failed, proceeding with local logout');
  } finally {
    // Șterge token-ul și datele utilizatorului din localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }
};

// Verifică dacă utilizatorul este autentificat
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Verifică dacă token-ul este valid (poate fi folosit pentru route protection)
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify-token');
    return response.data.valid;
  } catch (error) {
    console.error('Token verification failed:', error);
    // Dacă verificarea eșuează, deconectăm utilizatorul
    logout();
    return false;
  }
};

// Obține tipul utilizatorului curent
export const getUserType = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.userType || localStorage.getItem('userType') || 'user';
};

// Verifică dacă utilizatorul are un anumit rol
export const hasRole = (role) => {
  return getUserType() === role;
};

// Obține utilizatorul curent din localStorage
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || '{}');
};

// Expune API pentru a fi folosit în alte servicii
export { api };

export default {
  login,
  registerUser,
  logout,
  isAuthenticated,
  verifyToken,
  getUserType,
  hasRole,
  getCurrentUser,
  api
};