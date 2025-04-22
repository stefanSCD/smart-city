import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard'; 
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
// Importă componentul nou
import ProtectedRoute from './components/ProtectedRoute';
// Poți păstra și verificarea isAuthenticated pentru alte scopuri
import { isAuthenticated } from './services/authService';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Rute protejate utilizând componentul ProtectedRoute */}
          <Route path="/userDashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/adminDashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/employeeDashboard" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Redirecționează de la pagina principală la login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Redirecționează orice altă rută necunoscută către login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;