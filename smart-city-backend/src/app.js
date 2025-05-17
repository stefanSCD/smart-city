const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const fs = require('fs');

const avatarsPath = path.join(__dirname, '..', 'public/images/avatars');
console.log('Avatars directory exists:', fs.existsSync(avatarsPath));
console.log('Full path to avatars directory:', avatarsPath);

app.use('/images', express.static(path.join(__dirname, '..', 'public/images')));
app.use('/public/images', express.static(path.join(__dirname, '..', 'public/images')));

app.use('/uploads/problems', express.static(path.join(__dirname, '..', 'uploads', 'problems')));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(helmet()); // Adaugă headers de securitate
app.use(morgan('dev')); // Logging pentru dezvoltare

// Ruta principală
app.get('/', (req, res) => {
  res.send('Smart City API is running');
});


try {
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/problems', require('./routes/problemRoutes'));
  app.use('/api/employees', require('./routes/employeeRoutes'));
  app.use('/api/auth', require('./routes/authRoutes'));
  const tempProblemGraphRoutes = require('./routes/tempProblemGraphRoutes');
  app.use('/api/temp-problem-graphs', tempProblemGraphRoutes);
  const adminRouter = express.Router();
  adminRouter.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      req.user = { userType: 'admin' };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  });
  
  adminRouter.use((req, res, next) => {
    if (!req.user || req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
    }
    next();
  });
  
  const adminController = require('./controllers/adminController');

  adminRouter.get('/test', (req, res) => {
    res.json({ message: 'Admin routes are working' });
  });
  
  adminRouter.get('/employees', adminController.getAllEmployees);
  adminRouter.post('/employees', adminController.addEmployee);
  adminRouter.put('/employees/:id', adminController.updateEmployee);
  adminRouter.delete('/employees/:id', adminController.deleteEmployee);
  adminRouter.post('/employees/:id/reset-password', adminController.resetEmployeePassword);
  
  adminRouter.get('/departments', adminController.getAllDepartments);
  adminRouter.post('/departments', adminController.addDepartment);
  
  adminRouter.get('/cameras', adminController.getAllCameras);
  adminRouter.post('/cameras', adminController.addCamera);
  adminRouter.put('/cameras/:id', adminController.updateCamera);
  adminRouter.delete('/cameras/:id', adminController.deleteCamera);
  adminRouter.patch('/cameras/:id/ai', adminController.toggleCameraAI);
  adminRouter.get('/cameras/statistics', adminController.getCameraStatistics);
  
  adminRouter.get('/notifications', adminController.getAllNotifications);
  adminRouter.patch('/notifications/:id/read', adminController.markNotificationAsRead);
  adminRouter.patch('/notifications/mark-all-read', adminController.markAllNotificationsAsRead);
  adminRouter.get('/notifications/camera-alerts', adminController.getCameraAlerts);
  
  app.use('/api/admin', adminRouter);
  console.log('Admin routes loaded successfully');
  
  console.log('Toate rutele au fost încărcate cu succes');
} catch (error) {
  console.error('Eroare la încărcarea rutelor:', error);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'A apărut o eroare pe server', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta nu a fost găsită' });
});

const fixUsersUpdatedAt = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'updated_at'
    `);
    
    if (result.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE
      `);
      
      await sequelize.query(`
        UPDATE users 
        SET updated_at = created_at 
        WHERE updated_at IS NULL
      `);
      
      console.log('Fixed users.updated_at column');
    }
  } catch (error) {
    console.error('Error fixing users.updated_at:', error);
  }
};

const createDepartmentsTable = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'departments'
    `);
    
    if (result.length === 0) {
      await sequelize.query(`
        CREATE TABLE departments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      await sequelize.query(`
        INSERT INTO departments (name, created_at, updated_at)
        VALUES 
        ('Primărie', NOW(), NOW()),
        ('Poliția Locală', NOW(), NOW()),
        ('Salubritate', NOW(), NOW()),
        ('Transport Public', NOW(), NOW()),
        ('Spații Verzi', NOW(), NOW()),
        ('Infrastructură', NOW(), NOW()),
        ('Asistență Socială', NOW(), NOW())
      `);
      
      console.log('Created departments table with default departments');
    }
  } catch (error) {
    console.error('Error creating departments table:', error);
  }
};

const createCamerasTable = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cameras'
    `);
    
    if (result.length === 0) {
      await sequelize.query(`
        CREATE TABLE cameras (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          status VARCHAR(255) DEFAULT 'active',
          type VARCHAR(255) NOT NULL,
          stream_url VARCHAR(255) NOT NULL,
          ai_enabled BOOLEAN DEFAULT false,
          thumbnail VARCHAR(255) DEFAULT '/api/placeholder/320/180',
          detections INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP WITH TIME ZONE
        )
      `);
      
      await sequelize.query(`
        INSERT INTO cameras (name, location, status, type, stream_url, ai_enabled, thumbnail, detections, created_at, updated_at)
        VALUES 
        ('Piața Centrală', 'Strada Victoriei, Nr. 10', 'active', 'Traffic', 'rtsp://example.com/camera1', true, '/api/placeholder/320/180', 142, NOW(), NOW()),
        ('Parcul Municipal', 'Strada Parcului, Nr. 5', 'active', 'Public Safety', 'rtsp://example.com/camera2', true, '/api/placeholder/320/180', 87, NOW(), NOW()),
        ('Intersecție Bd. Principal', 'Bd. Principal / Str. Secundară', 'maintenance', 'Traffic', 'rtsp://example.com/camera3', false, '/api/placeholder/320/180', 203, NOW(), NOW()),
        ('Stația de autobuz', 'Bd. Republicii, Nr. 15', 'inactive', 'Public Transport', 'rtsp://example.com/camera4', false, '/api/placeholder/320/180', 56, NOW(), NOW())
      `);
      
      console.log('Created cameras table with default cameras');
    }
  } catch (error) {
    console.error('Error creating cameras table:', error);
  }
};

const updateUsersTable = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'user_type'
    `);
    
    if (result.length === 0) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS user_type VARCHAR(255) DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS department VARCHAR(255),
        ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS position VARCHAR(255),
        ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true
      `);
      
      await sequelize.query(`
        UPDATE users 
        SET user_type = 'user' 
        WHERE user_type IS NULL OR user_type = ''
      `);
      
      console.log('Updated users table with new columns');
      
      const [adminResult] = await sequelize.query(`
        SELECT id FROM users WHERE user_type = 'admin' LIMIT 1
      `);
      
      if (adminResult.length === 0) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const { v4: uuidv4 } = require('uuid');
        const adminId = uuidv4();
        
        await sequelize.query(`
          INSERT INTO users (id, prenume, nume, email, password, user_type, active, created_at, updated_at)
          VALUES (
            '${adminId}',
            'Admin',
            'User',
            'admin@smartcity.com',
            '${hashedPassword}',
            'admin',
            true,
            NOW(),
            NOW()
          )
        `);
        
        console.log('Created default admin user');
      }
    }
  } catch (error) {
    console.error('Error updating users table:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    await fixUsersUpdatedAt();
    await createDepartmentsTable();
    await createCamerasTable();
    await updateUsersTable();
    
    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
});

module.exports = app;