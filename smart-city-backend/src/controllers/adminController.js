// src/controllers/adminController.js
const { User, Problem, Notification, Camera, Department, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Middleware pentru verificarea dacă utilizatorul este admin
exports.checkAdmin = (req, res, next) => {
  // Verificăm dacă există un utilizator și dacă acesta are rol de admin
  if (!req.user || req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
  }
  next();
};

// ============= GESTIONARE UTILIZATORI/ANGAJAȚI =============

// Obține toți angajații
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { 
        userType: 'employee' // Toți utilizatorii care sunt angajați
      },
      attributes: { exclude: ['password'] } // Nu includem parola în răspuns
    });

    // Formatăm răspunsul pentru a se potrivi cu așteptările frontend-ului
    const formattedEmployees = employees.map(employee => ({
      id: employee.id,
      firstName: employee.prenume || '',
      lastName: employee.nume || '',
      email: employee.email,
      department: employee.department || '',
      role: employee.position || '',
      dateAdded: employee.createdAt,
      status: employee.isActive ? 'active' : 'inactive'
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error retrieving employees:', error);
    res.status(500).json({ message: 'Error retrieving employees', error: error.message });
  }
};

// Adaugă un angajat nou
exports.addEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, role, status, department_id } = req.body;
    
    // Verificăm dacă email-ul este deja folosit
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Creăm utilizatorul nou fără a specifica ID-ul, lăsând baza de date să genereze un ID numeric auto-incrementat
    const newEmployee = await sequelize.query(`
      INSERT INTO users (
        email, password, nume, prenume, user_type, department, position, active, created_at, updated_at
      ) VALUES (
        :email, :password, :lastName, :firstName, 'employee', :department, :role, :active, NOW(), NOW()
      ) RETURNING id, email, nume, prenume, user_type, department, position, active, created_at, updated_at
    `, {
      replacements: {
        email,
        password: hashedPassword,
        lastName,
        firstName,
        department,
        role,
        active: status === 'active'
      },
      type: sequelize.QueryTypes.INSERT
    });
    
    // Formatăm răspunsul
    const employeeData = newEmployee[0][0];
    const formattedEmployee = {
      id: employeeData.id,
      firstName: employeeData.prenume || employeeData.nume,
      lastName: employeeData.nume || employeeData.prenume,
      email: employeeData.email,
      department: employeeData.department || '',
      role: employeeData.position || '',
      dateAdded: employeeData.created_at,
      status: employeeData.active ? 'active' : 'inactive'
    };
    
    res.status(201).json(formattedEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ message: 'Error creating employee', error: error.message });
  }
};
// Actualizează un angajat
exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, department, role, status } = req.body;
    
    // Actualizăm angajatul
    const updated = await User.update(
      {
        prenume: firstName,
        nume: lastName,
        email: email,
        department: department,
        position: role,
        isActive: status === 'active'
      },
      {
        where: { id: req.params.id }
      }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Obține angajatul actualizat
    const updatedEmployee = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    // Formatăm răspunsul
    const formattedEmployee = {
      id: updatedEmployee.id,
      firstName: updatedEmployee.prenume,
      lastName: updatedEmployee.nume,
      email: updatedEmployee.email,
      department: updatedEmployee.department || '',
      role: updatedEmployee.position || '',
      dateAdded: updatedEmployee.createdAt,
      status: updatedEmployee.isActive ? 'active' : 'inactive'
    };
    
    res.json(formattedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ message: 'Error updating employee', error: error.message });
  }
};

// Șterge un angajat
exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

// Resetează parola unui angajat
exports.resetEmployeePassword = async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    // Generăm o parolă temporară
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Hash parola temporară
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    // Actualizăm parola angajatului
    const updated = await User.update(
      { password: hashedPassword },
      { where: { id: employeeId } }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Trimite parola temporară către angajat (în producție ar trebui trimisă prin email)
    res.json({ 
      message: 'Password reset successfully',
      temporaryPassword: tempPassword // În producție, nu trimite parola în răspuns, ci prin email
    });
  } catch (error) {
    console.error('Error resetting employee password:', error);
    res.status(500).json({ message: 'Error resetting employee password', error: error.message });
  }
};

// ============= GESTIONARE DEPARTAMENTE =============

// Obține toate departamentele
exports.getAllDepartments = async (req, res) => {
  try {
    // Verificăm dacă avem tabelul Department
    let departments = [];
    
    try {
      // Încercăm să obținem departamente din tabelul departments
      const deptModels = await Department.findAll();
      departments = deptModels.map(dept => dept.name);
    } catch (err) {
      console.log('Department model not available, using alternative method');
      
      // Dacă nu avem tabelul departments, extragem direct din baza de date
      const [deptRows] = await sequelize.query(`
        SELECT name FROM departments
      `);
      
      if (deptRows && deptRows.length > 0) {
        departments = deptRows.map(row => row.name);
      } else {
        // Extrage departamente unice din utilizatori
        const users = await User.findAll({
          attributes: ['department'],
          where: {
            department: {
              [Op.not]: null
            }
          }
        });
        
        // Extrage și deduplică departamentele
        departments = [...new Set(users.map(user => user.department).filter(Boolean))];
      }
    }
    
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Adaugă un departament nou
exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    
    let department;
    
    try {
      // Încercăm să folosim modelul Department
      // Verificăm dacă departamentul există deja
      const existingDepartment = await Department.findOne({ where: { name } });
      
      if (existingDepartment) {
        return res.status(400).json({ message: 'Department already exists' });
      }
      
      department = await Department.create({ name });
    } catch (err) {
      console.log('Department model not available, using direct SQL');
      
      // Verificăm dacă departamentul există deja folosind SQL direct
      const [existingDepts] = await sequelize.query(`
        SELECT id FROM departments WHERE name = ?
      `, {
        replacements: [name]
      });
      
      if (existingDepts && existingDepts.length > 0) {
        return res.status(400).json({ message: 'Department already exists' });
      }
      
      // Inserăm direct în baza de date
      const [result] = await sequelize.query(`
        INSERT INTO departments (name, created_at, updated_at)
        VALUES (?, NOW(), NOW())
        RETURNING id, name
      `, {
        replacements: [name]
      });
      
      department = result[0] || { name };
    }
    
    res.status(201).json(department);
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(400).json({ message: 'Error adding department', error: error.message });
  }
};

// ============= GESTIONARE CAMERE VIDEO =============

// Obține toate camerele
exports.getAllCameras = async (req, res) => {
  try {
    let cameras = [];
    
    try {
      // Încercăm să folosim modelul Camera
      cameras = await Camera.findAll();
    } catch (err) {
      console.log('Camera model not available, using direct SQL');
      
      // Obținem camerele direct din baza de date
      const [cameraRows] = await sequelize.query(`
        SELECT * FROM cameras
      `);
      
      cameras = cameraRows || [];
    }
    
    res.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ message: 'Error fetching cameras', error: error.message });
  }
};

// Adaugă o cameră nouă
exports.addCamera = async (req, res) => {
  try {
    const { name, location, type, streamUrl, status, aiEnabled } = req.body;
    
    // Creăm camera folosind un query SQL direct
    const [result] = await sequelize.query(`
      INSERT INTO cameras (
        name, location, type, "streamUrl", status, "aiEnabled", detections, created_at, updated_at
      ) VALUES (
        :name, :location, :type, :streamUrl, :status, :aiEnabled, 0, NOW(), NOW()
      ) RETURNING id, name, location, type, "streamUrl", status, "aiEnabled", detections, created_at, updated_at
    `, {
      replacements: {
        name,
        location,
        type,
        streamUrl,
        status: status || 'active',
        aiEnabled: aiEnabled || false
      },
      type: sequelize.QueryTypes.INSERT
    });
    
    // Formatăm răspunsul
    const newCamera = result[0];
    
    res.status(201).json(newCamera);
  } catch (error) {
    console.error('Error adding camera:', error);
    res.status(400).json({ message: 'Error adding camera', error: error.message });
  }
};

// Actualizează o cameră
exports.updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, status, aiEnabled } = req.body;
    
    let updatedCamera;
    
    try {
      // Încercăm să folosim modelul Camera
      const updated = await Camera.update(
        {
          name,
          location,
          type,
          status,
          aiEnabled
        },
        {
          where: { id }
        }
      );
      
      if (updated[0] === 0) {
        return res.status(404).json({ message: 'Camera not found' });
      }
      
      updatedCamera = await Camera.findByPk(id);
    } catch (err) {
      console.log('Camera model not available, using direct SQL');
      
      // Actualizăm camera direct în baza de date
      const [updated] = await sequelize.query(`
        UPDATE cameras
        SET name = ?, location = ?, type = ?, status = ?, ai_enabled = ?, updated_at = NOW()
        WHERE id = ?
      `, {
        replacements: [name, location, type, status, aiEnabled, id]
      });
      
      if (updated === 0) {
        return res.status(404).json({ message: 'Camera not found' });
      }
      
      // Obținem camera actualizată
      const [result] = await sequelize.query(`
        SELECT id, name, location, type, status, stream_url as "streamUrl", ai_enabled as "aiEnabled", detections, created_at as "createdAt", updated_at as "updatedAt"
        FROM cameras
        WHERE id = ?
      `, {
        replacements: [id]
      });
      
      updatedCamera = result[0];
    }
    
    res.json(updatedCamera);
  } catch (error) {
    console.error('Error updating camera:', error);
    res.status(400).json({ message: 'Error updating camera', error: error.message });
  }
};

// Șterge o cameră
exports.deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    
    let deleted = 0;
    
    try {
      // Încercăm să folosim modelul Camera
      deleted = await Camera.destroy({
        where: { id }
      });
    } catch (err) {
      console.log('Camera model not available, using direct SQL');
      
      // Ștergem camera direct din baza de date
      const [result] = await sequelize.query(`
        DELETE FROM cameras
        WHERE id = ?
      `, {
        replacements: [id]
      });
      
      deleted = result;
    }
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    
    res.status(200).json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    res.status(500).json({ message: 'Error deleting camera', error: error.message });
  }
};

// Activează/dezactivează AI pentru o cameră
exports.toggleCameraAI = async (req, res) => {
  try {
    const { id } = req.params;
    const { aiEnabled } = req.body;
    
    // Actualizăm camera folosind un query SQL direct
    const [result] = await sequelize.query(`
      UPDATE cameras
      SET "aiEnabled" = :aiEnabled, updated_at = NOW()
      WHERE id = :id
      RETURNING id, name, location, type, status, "streamUrl", "aiEnabled", detections, created_at, updated_at
    `, {
      replacements: {
        id,
        aiEnabled
      },
      type: sequelize.QueryTypes.UPDATE
    });
    
    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Camera not found' });
    }
    
    // Returnăm camera actualizată
    const updatedCamera = result[0];
    
    res.json(updatedCamera);
  } catch (error) {
    console.error('Error toggling camera AI:', error);
    res.status(400).json({ message: 'Error toggling camera AI', error: error.message });
  }
};

// Obține statistici despre camere
exports.getCameraStatistics = async (req, res) => {
  try {
    // Statistici implicite
    let stats = {
      total: 0,
      active: 0,
      detections: 0
    };
    
    // Obținem statisticile direct din baza de date cu numele corecte ale coloanelor
    const [totalResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM cameras
    `);
    
    if (totalResult && totalResult.length > 0) {
      stats.total = parseInt(totalResult[0].total);
    }
    
    const [activeResult] = await sequelize.query(`
      SELECT COUNT(*) as active FROM cameras WHERE status = 'active'
    `);
    
    if (activeResult && activeResult.length > 0) {
      stats.active = parseInt(activeResult[0].active);
    }
    
    const [detectionsResult] = await sequelize.query(`
      SELECT SUM(detections) as total_detections FROM cameras WHERE "aiEnabled" = true
    `);
    
    if (detectionsResult && detectionsResult.length > 0 && detectionsResult[0].total_detections) {
      stats.detections = parseInt(detectionsResult[0].total_detections);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching camera statistics:', error);
    res.status(500).json({ message: 'Error fetching camera statistics', error: error.message });
  }
};

// ============= GESTIONARE NOTIFICĂRI =============

// Obține toate notificările
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [['created_at', 'DESC']],
      limit: 50
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Marchează o notificare ca citită
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const updated = await Notification.update(
      { is_read: true },
      { where: { id: notificationId } }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Marchează toate notificările ca citite
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { is_read: false } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// Obține alertele legate de camere
exports.getCameraAlerts = async (req, res) => {
  try {
    // Obținem toate notificările necitite, deoarece nu avem o coloană pentru tipul notificării
    const alerts = await sequelize.query(`
      SELECT * FROM notifications
      WHERE is_read = false
      ORDER BY created_at DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching camera alerts:', error);
    res.status(500).json({ message: 'Error fetching camera alerts', error: error.message });
  }
};

module.exports = exports;