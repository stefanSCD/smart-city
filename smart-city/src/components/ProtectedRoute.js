// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Verifică dacă există un token de autentificare
  const isAuthenticated = localStorage.getItem('token');
  
  // Dacă nu există token, redirecționează către pagina de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Dacă există token, afișează componenta copil
  return children;
};

export default ProtectedRoute;