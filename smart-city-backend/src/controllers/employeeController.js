const { Employee, Problem } = require('../models');
const bcrypt = require('bcryptjs');

// Obține toți angajații
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employees', error: error.message });
  }
};

// Obține un angajat după ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Problem }]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employee', error: error.message });
  }
};

// Creează un angajat nou
exports.createEmployee = async (req, res) => {
  try {
    // Hash parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const employeeData = {
      ...req.body,
      password: hashedPassword
    };
    
    const newEmployee = await Employee.create(employeeData);
    
    // Nu trimitem parola înapoi
    const { password, ...employeeWithoutPassword } = newEmployee.toJSON();
    
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: 'Error creating employee', error: error.message });
  }
};

// Actualizează un angajat
exports.updateEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body };
    
    // Dacă se actualizează parola, hash-o
    if (employeeData.password) {
      const salt = await bcrypt.genSalt(10);
      employeeData.password = await bcrypt.hash(employeeData.password, salt);
    }
    
    const updated = await Employee.update(employeeData, {
      where: { id: req.params.id }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const updatedEmployee = await Employee.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error: error.message });
  }
};

// Șterge un angajat
exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

// Obține problemele asignate unui angajat
exports.getEmployeeProblems = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: Problem }],
      attributes: { exclude: ['password'] }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee.Problems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employee problems', error: error.message });
  }
};

// Obține angajații după departament
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { department: req.params.department },
      attributes: { exclude: ['password'] }
    });
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employees by department', error: error.message });
  }
};