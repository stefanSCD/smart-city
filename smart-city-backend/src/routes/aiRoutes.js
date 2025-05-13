// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Procesează o imagine de problemă specifică (fără autentificare pentru simplitate)
router.post('/process/:problemId', aiController.processProblemImage);

module.exports = router;