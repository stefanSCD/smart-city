const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

console.log('authenticateToken is a function:', typeof authenticateToken === 'function');
console.log('userController.uploadAvatar is a function:', typeof userController.uploadAvatar === 'function');
console.log('All userController methods:', Object.keys(userController));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../public/images/avatars'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'avatar-' + uniqueSuffix + ext);
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

try {
  const uploadMiddleware = upload.single('avatar');
  console.log('upload.single is a function:', typeof uploadMiddleware === 'function');
  
  router.post('/avatar', authenticateToken, uploadMiddleware, userController.uploadAvatar);
} catch (error) {
  console.error('Error setting up avatar route:', error);
}

router.put('/update', authenticateToken, userController.updateUser);
router.get('/reports/recent', userController.getUserRecentReports);
router.get('/profile', authenticateToken, userController.getUserProfile);
router.post('/change-password', authenticateToken, userController.changePassword);
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.get('/:id/problems', authenticateToken, userController.getUserProblems);

module.exports = router;