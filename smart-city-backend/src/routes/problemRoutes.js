// src/routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Rute pentru probleme
router.get('/', problemController.getAllProblems);
router.get('/:id', problemController.getProblemById);
router.post('/', problemController.createProblem);
router.put('/:id', problemController.updateProblem);
router.delete('/:id', problemController.deleteProblem);
router.post('/assign', problemController.assignProblemToEmployee);

module.exports = router;