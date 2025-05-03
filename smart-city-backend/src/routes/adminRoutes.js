// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Adăugăm o rută de test pentru admin
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working' });
});

// ============= RUTE PENTRU GESTIONAREA ANGAJAȚILOR =============
router.get('/employees', adminController.getAllEmployees);
router.post('/employees', adminController.addEmployee);
router.put('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);
router.post('/employees/:id/reset-password', adminController.resetEmployeePassword);

// ============= RUTE PENTRU GESTIONAREA DEPARTAMENTELOR =============
router.get('/departments', adminController.getAllDepartments);
router.post('/departments', adminController.addDepartment);

// ============= RUTE PENTRU GESTIONAREA CAMERELOR VIDEO =============
router.get('/cameras', adminController.getAllCameras);
router.post('/cameras', adminController.addCamera);
router.put('/cameras/:id', adminController.updateCamera);
router.delete('/cameras/:id', adminController.deleteCamera);
router.patch('/cameras/:id/ai', adminController.toggleCameraAI);
router.get('/cameras/statistics', adminController.getCameraStatistics);

// ============= RUTE PENTRU GESTIONAREA NOTIFICĂRILOR =============
router.get('/notifications', adminController.getAllNotifications);
router.patch('/notifications/:id/read', adminController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', adminController.markAllNotificationsAsRead);
router.get('/notifications/camera-alerts', adminController.getCameraAlerts);

module.exports = router;