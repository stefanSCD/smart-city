const { User, Employee } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login utilizator
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifică dacă utilizatorul există
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verifică parola
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generează token JWT
    const token = jwt.sign(
      { id: user.id, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nume: user.nume,
        prenume: user.prenume,
        type: 'user'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Login angajat
exports.loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verifică dacă angajatul există
    const employee = await Employee.findOne({ where: { username } });
    
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verifică parola
    const isMatch = await bcrypt.compare(password, employee.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generează token JWT
    const token = jwt.sign(
      { id: employee.id, type: 'employee', department: employee.department },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: employee.id,
        username: employee.username,
        nume: employee.nume,
        prenume: employee.prenume,
        department: employee.department,
        role: employee.role,
        type: 'employee'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Obține profilul utilizatorului curent
exports.getProfile = async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({ ...user.toJSON(), type: 'user' });
    } else {
      const employee = await Employee.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      return res.json({ ...employee.toJSON(), type: 'employee' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};