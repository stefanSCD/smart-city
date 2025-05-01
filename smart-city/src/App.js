// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componente de autentificare
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';

// Dashboard-uri specifice rolurilor
import UserDashboard from './components/dashboard/UserDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Componenta pentru rute protejate
import ProtectedRoute from './components/ProtectedRoute';

// Alte componente
import LocationMap from './components/LocationMap';
import { getUserType, isAuthenticated } from './services/authService';

function App() {
  // Funcție pentru a redirecționa utilizatorul la dashboard-ul corespunzător în funcție de rol
  const redirectToDashboard = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    
    const userType = getUserType();
    
    switch(userType) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'employee':
        return <Navigate to="/employee/dashboard" />;
      default:
        return <Navigate to="/userDashboard" />;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Redirecționare de la ruta principală către dashboard */}
        <Route path="/" element={redirectToDashboard()} />
        
        {/* Rute de autentificare accesibile public */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        
        {/* Dashboard utilizator normal - accesibil pentru toți utilizatorii autentificați */}
        <Route
          path="/userDashboard/*"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard angajat - accesibil doar pentru angajați și admin */}
        <Route
          path="/employee/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard administrator - accesibil doar pentru admin */}
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Hartă locație - accesibilă pentru toți utilizatorii autentificați */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <LocationMap />
            </ProtectedRoute>
          }
        />
        
        {/* Rută pentru pagini care nu există - redirecționare către dashboard */}
        <Route path="*" element={redirectToDashboard()} />
      </Routes>
    </Router>
  );
}

export default App;