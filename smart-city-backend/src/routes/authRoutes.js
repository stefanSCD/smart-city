const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rute pentru autentificare
router.post('/login/user', authController.loginUser);
router.post('/login/employee', authController.loginEmployee);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;