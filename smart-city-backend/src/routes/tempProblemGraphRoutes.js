// src/routes/tempProblemGraphRoutes.js
const express = require('express');
const router = express.Router();
const tempProblemGraphController = require('../controllers/tempProblemGraphController');

// Pentru testare, pot omite middleware-ul de autentificare temporar
router.get('/', tempProblemGraphController.getAllTempProblemGraphs);
router.post('/:id/resolve', tempProblemGraphController.resolveTempProblem);
module.exports = router;