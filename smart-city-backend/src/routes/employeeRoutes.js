const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configurare storage pentru încărcarea imaginilor
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/avatars');
        // Asigură-te că directorul există
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// ============= RUTE DE BAZĂ EXISTENTE =============
router.get('/', authenticateToken, employeeController.getAllEmployees);
router.get('/:id', authenticateToken, employeeController.getEmployeeById);
router.post('/', authenticateToken, employeeController.createEmployee);
router.put('/:id', authenticateToken, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);
router.get('/:id/problems', authenticateToken, employeeController.getEmployeeProblems);
router.get('/department/:department', authenticateToken, employeeController.getEmployeesByDepartment);

// ============= RUTE NOI PENTRU PROFILUL ANGAJATULUI =============
// Obține profilul angajatului autentificat
router.get('/profile/me', authenticateToken, employeeController.getEmployeeProfile);

// Actualizare profil angajat
router.put('/profile/update', authenticateToken, employeeController.updateEmployeeProfile);

// Încărcare imagine profil
router.post('/profile/avatar', authenticateToken, upload.single('avatar'), employeeController.uploadEmployeeAvatar);

// Schimbare parolă
router.post('/profile/change-password', authenticateToken, employeeController.changeEmployeePassword);

// ============= RUTE NOI PENTRU GESTIONAREA PROBLEMELOR TEMPORARE =============
// Obținerea problemelor temporare pentru departamentul angajatului
router.get('/problems/temp', authenticateToken, employeeController.getEmployeeTempProblems);

// Actualizare status problemă temporară
router.put('/problems/temp/:id/status', authenticateToken, employeeController.updateTempProblemStatus);

// Marcarea unei probleme temporare ca rezolvată
router.put('/problems/temp/:id/resolve', authenticateToken, employeeController.resolveTempProblem);

// Obținerea statisticilor angajatului
router.get('/statistics', authenticateToken, employeeController.getEmployeeStatistics);

module.exports = router;