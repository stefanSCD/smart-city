// src/routes/problemRoutes.js

const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Rute pentru probleme - fără autentificare temporar
// Obține toate problemele
router.get('/', problemController.getProblems);

// Obține problemă după ID
router.get('/:id', problemController.getProblemById);

// Creează o problemă nouă (cu sau fără fișier media)
router.post('/', problemController.uploadMiddleware, problemController.createProblem);

// Actualizează o problemă
router.put('/:id', problemController.updateProblem);

// Actualizează statusul unei probleme
router.put('/:id/status', problemController.updateProblemStatus);

// Șterge o problemă
router.delete('/:id', problemController.deleteProblem);

// Asignează o problemă unui angajat
router.post('/:id/assign', problemController.assignProblemToEmployee);

// Adaugă un comentariu la o problemă
router.post('/:id/comments', problemController.addProblemComment);

// Obține probleme după status
router.get('/status/:status', problemController.getProblemsByStatus);

// Obține problemele raportate de un utilizator
router.get('/user/:user_id', problemController.getProblemsByUser);

// Obține problemele asignate unui angajat
router.get('/assigned/:user_id', problemController.getAssignedProblems);

// Exportă router-ul
module.exports = router;