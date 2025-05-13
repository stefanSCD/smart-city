const { User, Problem, TempProblemGraph, Department } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// ============= FUNCȚII EXISTENTE =============
// Obține toți angajații
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { userType: 'employee' },
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
    const employee = await User.findByPk(req.params.id, {
      where: { userType: 'employee' },
      attributes: { exclude: ['password'] },
      include: [
        { 
          model: Problem, 
          as: 'assignedProblems' 
        },
        {
          model: Department,
          as: 'departmentDetails'
        }
      ]
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
      userType: 'employee',
      password: hashedPassword
    };
    
    const newEmployee = await User.create(employeeData);
    
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
    
    const updated = await User.update(employeeData, {
      where: { 
        id: req.params.id,
        userType: 'employee'
      }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const updatedEmployee = await User.findByPk(req.params.id, {
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
    const deleted = await User.destroy({
      where: { 
        id: req.params.id,
        userType: 'employee'
      }
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
    const employee = await User.findOne({
      where: {
        id: req.params.id,
        userType: 'employee'
      },
      include: [{ 
        model: Problem,
        as: 'assignedProblems'
      }],
      attributes: { exclude: ['password'] }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee.assignedProblems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employee problems', error: error.message });
  }
};

// Obține angajații după departament
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const department = await Department.findOne({
      where: { name: req.params.department }
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const employees = await User.findAll({
      where: { 
        department_id: department.id,
        userType: 'employee'
      },
      attributes: { exclude: ['password'] }
    });
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employees by department', error: error.message });
  }
};

// ============= FUNCȚII NOI PENTRU PROFIL =============

// Obține profilul angajatului autentificat
exports.getEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      },
      include: [
        {
          model: Department,
          as: 'departmentDetails',
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Profil angajat negăsit' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Eroare la obținerea profilului:', error);
    res.status(500).json({ message: 'Eroare la obținerea profilului', error: error.message });
  }
};

// Actualizare profil angajat
exports.updateEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nume, prenume, email, phone, address } = req.body;
    
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Profil angajat negăsit' });
    }
    
    // Verificăm dacă email-ul există deja la alt utilizator
    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: userId }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Acest email este deja utilizat' });
      }
    }
    
    await employee.update({
      nume: nume || employee.nume,
      prenume: prenume || employee.prenume,
      email: email || employee.email,
      phone: phone || employee.phone,
      address: address || employee.address
    });
    
    // Obținem angajatul actualizat cu relații
    const updatedEmployee = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Department,
          as: 'departmentDetails',
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea profilului', error: error.message });
  }
};

// Încărcare imagine profil
exports.uploadEmployeeAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Nu a fost furnizată nicio imagine' });
    }
    
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Profil angajat negăsit' });
    }
    
    // Ștergem imaginea veche dacă există și nu este implicită
    if (employee.avatar && employee.avatar !== '/api/placeholder/200/200' && !employee.avatar.includes('default')) {
      const oldImagePath = path.join(__dirname, '../../public', employee.avatar);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Setăm calea către noua imagine
    const avatarPath = `/images/avatars/${req.file.filename}`;
    await employee.update({ avatar: avatarPath });
    
    res.json({
      message: 'Imaginea de profil a fost actualizată cu succes',
      avatarPath
    });
  } catch (error) {
    console.error('Eroare la încărcarea imaginii de profil:', error);
    res.status(500).json({ message: 'Eroare la încărcarea imaginii de profil', error: error.message });
  }
};

// Schimbare parolă
exports.changeEmployeePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    // Validăm datele de intrare
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ambele parole sunt obligatorii' });
    }
    
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      }
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Profil angajat negăsit' });
    }
    
    // Verificăm parola veche
    const isPasswordValid = await bcrypt.compare(oldPassword, employee.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Parola veche este incorectă' });
    }
    
    // Hash parola nouă
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizăm parola
    await employee.update({ password: hashedPassword });
    
    res.json({ message: 'Parola a fost schimbată cu succes' });
  } catch (error) {
    console.error('Eroare la schimbarea parolei:', error);
    res.status(500).json({ message: 'Eroare la schimbarea parolei', error: error.message });
  }
};

// ============= FUNCȚII NOI PENTRU PROBLEME TEMPORARE =============

// Obținerea problemelor temporare pentru departamentul angajatului
exports.getEmployeeTempProblems = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obținem angajatul cu departamentul său
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      },
      include: [
        {
          model: Department,
          as: 'departmentDetails'
        }
      ]
    });
    
    if (!employee || !employee.departmentDetails) {
      return res.status(404).json({ message: 'Departamentul angajatului nu a fost găsit' });
    }
    
    // Obținem problemele pentru departamentul respectiv
    const problems = await Problem.findAll({
      where: {
        department: employee.departmentDetails.name
      },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'nume', 'prenume', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Obținem problemele temporare asociate acestor probleme
    const problemIds = problems.map(p => p.id);
    const tempProblems = await TempProblemGraph.findAll({
      where: {
        problem_id: {
          [Op.in]: problemIds
        }
      },
      include: [
        {
          model: Problem,
          as: 'problem'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nume', 'prenume', 'email', 'avatar']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(tempProblems);
  } catch (error) {
    console.error('Eroare la obținerea problemelor temporare:', error);
    res.status(500).json({ message: 'Eroare la obținerea problemelor temporare', error: error.message });
  }
};

// Actualizare status problemă temporară
exports.updateTempProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!status) {
      return res.status(400).json({ message: 'Statusul este obligatoriu' });
    }
    
    // Verificăm dacă statusul este valid
    const validStatuses = ['reported', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Status invalid', 
        validValues: validStatuses 
      });
    }
    
    // Găsim problema temporară
    const tempProblem = await TempProblemGraph.findByPk(id, {
      include: [
        {
          model: Problem,
          as: 'problem'
        }
      ]
    });
    
    if (!tempProblem || !tempProblem.problem) {
      return res.status(404).json({ message: 'Problema temporară nu a fost găsită' });
    }
    
    // Verificăm dacă angajatul are acces la această problemă (face parte din departamentul său)
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      },
      include: [
        {
          model: Department,
          as: 'departmentDetails'
        }
      ]
    });
    
    if (!employee || !employee.departmentDetails) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    if (tempProblem.problem.department !== employee.departmentDetails.name) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a actualiza această problemă' });
    }
    
    // Actualizăm statusul problemei
    await tempProblem.problem.update({ status });
    
    // Actualizăm și data în problema temporară
    const updatedData = { 
      ...tempProblem.data, 
      status,
      updatedBy: userId,
      updatedAt: new Date()
    };
    
    await tempProblem.update({ data: updatedData });
    
    // Returnăm problema actualizată
    const updatedTempProblem = await TempProblemGraph.findByPk(id, {
      include: [
        {
          model: Problem,
          as: 'problem'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nume', 'prenume', 'email', 'avatar']
        }
      ]
    });
    
    res.json(updatedTempProblem);
  } catch (error) {
    console.error('Eroare la actualizarea statusului problemei:', error);
    res.status(500).json({ message: 'Eroare la actualizarea statusului problemei', error: error.message });
  }
};

// Marcarea unei probleme temporare ca rezolvată
exports.resolveTempProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, notes } = req.body;
    const userId = req.user.id;
    
    if (!resolution) {
      return res.status(400).json({ message: 'Rezoluția este obligatorie' });
    }
    
    // Găsim problema temporară
    const tempProblem = await TempProblemGraph.findByPk(id, {
      include: [
        {
          model: Problem,
          as: 'problem'
        }
      ]
    });
    
    if (!tempProblem || !tempProblem.problem) {
      return res.status(404).json({ message: 'Problema temporară nu a fost găsită' });
    }
    
    // Verificăm dacă angajatul are acces la această problemă (face parte din departamentul său)
    const employee = await User.findOne({
      where: { 
        id: userId,
        userType: 'employee'
      },
      include: [
        {
          model: Department,
          as: 'departmentDetails'
        }
      ]
    });
    
    if (!employee || !employee.departmentDetails) {
      return res.status(403).json({ message: 'Acces interzis' });
    }
    
    if (tempProblem.problem.department !== employee.departmentDetails.name) {
      return res.status(403).json({ message: 'Nu aveți permisiunea de a rezolva această problemă' });
    }
    
    // Actualizăm statusul problemei
    await tempProblem.problem.update({ 
      status: 'completed',
      resolved_by: userId,
      resolved_at: new Date(),
      resolution: resolution
    });
    
    // Actualizăm și data în problema temporară
    const updatedData = { 
      ...tempProblem.data, 
      status: 'completed',
      resolvedBy: userId,
      resolvedAt: new Date(),
      resolution,
      notes
    };
    
    await tempProblem.update({ data: updatedData });
    
    // Returnăm problema actualizată
    const updatedTempProblem = await TempProblemGraph.findByPk(id, {
      include: [
        {
          model: Problem,
          as: 'problem'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nume', 'prenume', 'email', 'avatar']
        }
      ]
    });
    
    res.json({
      message: 'Problema a fost rezolvată cu succes',
      tempProblem: updatedTempProblem
    });
  } catch (error) {
    console.error('Eroare la rezolvarea problemei:', error);
    res.status(500).json({ message: 'Eroare la rezolvarea problemei', error: error.message });
  }
};


// Obținerea statisticilor angajatului
exports.getEmployeeStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Numărul de probleme rezolvate
    const resolvedProblems = await Problem.count({
      where: {
        resolved_by: userId,
        status: 'completed'
      }
    });
    
    // Numărul de probleme în lucru
    const problemsInProgress = await Problem.count({
      where: {
        assigned_to: userId,
        status: 'in_progress'
      }
    });
    
    // Returnăm statisticile
    res.json({
      resolvedProblems,
      problemsInProgress,
      completedTasks: resolvedProblems, // Pentru compatibilitate cu UI-ul existent
      inProgressTasks: problemsInProgress // Pentru compatibilitate cu UI-ul existent
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea statisticilor', error: error.message });
  }
};