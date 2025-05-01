// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Debugging - verificăm metodele disponibile în authController
console.log('authController methods:', Object.keys(authController));

// Rute de autentificare
router.post('/login', authController.login);
router.post('/register', authController.registerUser);

// Implementăm o funcție logout temporară deoarece nu există în controller
router.post('/logout', (req, res) => {
  // Implementare simplă pentru logout, deoarece JWT-urile sunt stateless
  // În mod normal, token-ul ar fi invalidat pe server sau adăugat la o blacklist
  res.status(200).json({ message: 'Logged out successfully' });
});

// Verificare token
router.get('/verify-token', authController.verifyToken);

// Obținere profil
router.get('/profile', authenticateToken, authController.getProfile);

// Adăugăm alte rute disponibile pentru completitudine
router.post('/login-user', authController.loginUser);
router.post('/login-employee', authController.loginEmployee);
router.post('/login-admin', authController.loginAdmin);

// Rute pentru înregistrare specială
if (typeof authController.registerEmployee === 'function') {
  router.post('/register-employee', authenticateToken, authController.registerEmployee);
}

if (typeof authController.registerAdmin === 'function') {
  router.post('/register-admin', authenticateToken, authController.registerAdmin);
}

module.exports = router;