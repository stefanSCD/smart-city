// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, verifyToken, getUserType } from '../services/authService';

// ProtectedRoute cu verificare de rol
// allowedRoles poate fi un string (un singur rol) sau un array de roluri permise
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Verifică dacă există token în localStorage
      if (!isAuthenticated()) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }
      
      try {
        // Verifică dacă token-ul este valid prin apel la server
        const tokenValid = await verifyToken();
        
        if (!tokenValid) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }
        
        // Dacă există roluri permise, verifică rolul utilizatorului
        if (allowedRoles && allowedRoles.length > 0) {
          const userType = getUserType();
          
          // Convertește allowedRoles la array dacă este string
          const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
          
          // Verifică dacă utilizatorul are unul din rolurile permise
          const hasAllowedRole = roles.includes(userType);
          
          setIsValid(hasAllowedRole);
          setIsChecking(false);
        } else {
          // Dacă nu sunt specificate roluri, orice utilizator autentificat are acces
          setIsValid(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        setIsValid(false);
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [allowedRoles, location.pathname]);
  
  // Afișează un indicator de loading în timp ce verifică autentificarea
  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirecționează către login dacă utilizatorul nu este autentificat
  if (!isValid) {
    // Dacă utilizatorul este autentificat dar nu are rol potrivit, redirecționează la dashboard-ul specific rolului său
    if (isAuthenticated()) {
      const userType = getUserType();
      
      switch(userType) {
        case 'admin':
          return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
        case 'employee':
          return <Navigate to="/employee/dashboard" state={{ from: location }} replace />;
        default:
          return <Navigate to="/userDashboard" state={{ from: location }} replace />;
      }
    }
    
    // Dacă nu este autentificat deloc, redirecționează la login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Returnează componentele copil dacă utilizatorul este autentificat și are rol potrivit
  return children;
};

export default ProtectedRoute;