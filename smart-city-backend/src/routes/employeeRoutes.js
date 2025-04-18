const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/auth');

// Rute pentru angajați
router.get('/', authenticateToken, employeeController.getAllEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);
router.post('/', authenticateToken, employeeController.createEmployee);
router.put('/:id', authenticateToken, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);
router.get('/:id/problems', authenticateToken, employeeController.getEmployeeProblems);
router.get('/department/:department', authenticateToken, employeeController.getEmployeesByDepartment);

module.exports = router;