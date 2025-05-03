const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login unificat pentru toți utilizatorii
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Căutăm utilizatorul după email
    // Nu folosim coloana deleted_at 
    const user = await User.findOne({ 
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }
    
    // Verificăm parola
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }
    
    // Verificăm dacă utilizatorul are coloana lastLogin înainte de actualizare
    try {
      if (user.lastLogin !== undefined) {
        await user.update({ lastLogin: new Date() });
      }
    } catch (updateError) {
      console.log('Coloana lastLogin nu există, ignorăm actualizarea', updateError);
      // Continuăm procesul de login chiar dacă actualizarea a eșuat
    }
    
    // Construim payload-ul pentru token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      type: user.userType
    };
    
    // Adăugăm departamentul pentru angajați
    if (user.userType === 'employee' && user.department) {
      tokenPayload.department = user.department;
    }
    
    // Generăm token JWT
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    
    // Construim manual obiectul de răspuns pentru a evita probleme cu metoda toJSON
    const userResponse = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      nume: user.nume,
      prenume: user.prenume,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Eroare în timpul autentificării', error: error.message });
  }
};

// Păstrăm metodele vechi pentru compatibilitate, dar ele vor apela noua metodă
exports.loginUser = async (req, res) => {
  return exports.login(req, res);
};

exports.loginEmployee = async (req, res) => {
  return exports.login(req, res);
};

exports.loginAdmin = async (req, res) => {
  return exports.login(req, res);
};

// Obține profilul utilizatorului curent
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    
    // Construim manual obiectul de răspuns pentru a evita probleme cu metoda toJSON
    const userResponse = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      nume: user.nume,
      prenume: user.prenume,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return res.json(userResponse);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Eroare la obținerea profilului', error: error.message });
  }
};

// Verifică validitatea token-ului JWT
exports.verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'Token-ul lipsește' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ valid: false, message: 'Token invalid sau expirat' });
      }
      
      res.json({ valid: true, user: decoded });
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Eroare la verificarea token-ului' });
  }
};

// Înregistrare utilizator nou (user normal)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, nume, prenume, ...additionalData } = req.body;
    
    // Verifică dacă emailul este deja înregistrat
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Emailul este deja înregistrat' });
    }
    
    // Criptăm parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Creăm utilizatorul nou (tip implicit: 'user')
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nume,
      prenume,
      userType: 'user',
      ...additionalData
    });
    
    // Construim manual obiectul de răspuns pentru a evita probleme cu metoda toJSON
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      userType: newUser.userType,
      nume: newUser.nume,
      prenume: newUser.prenume,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    
    res.status(201).json({
      message: 'Utilizator înregistrat cu succes',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Eroare la înregistrare', error: error.message });
  }
};

// Înregistrare angajat (disponibil doar pentru administratori)
exports.registerEmployee = async (req, res) => {
  try {
    const { email, password, nume, prenume, department, position } = req.body;
    
    // Verifică dacă emailul este deja înregistrat
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Emailul este deja înregistrat' });
    }
    
    // Criptăm parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Creăm angajatul nou
    const newEmployee = await User.create({
      email,
      password: hashedPassword,
      nume,
      prenume,
      userType: 'employee',
      department,
      position
    });
    
    // Construim manual obiectul de răspuns pentru a evita probleme cu metoda toJSON
    const employeeResponse = {
      id: newEmployee.id,
      email: newEmployee.email,
      userType: newEmployee.userType,
      nume: newEmployee.nume,
      prenume: newEmployee.prenume,
      department: newEmployee.department,
      position: newEmployee.position,
      createdAt: newEmployee.createdAt,
      updatedAt: newEmployee.updatedAt
    };
    
    res.status(201).json({
      message: 'Angajat înregistrat cu succes',
      user: employeeResponse
    });
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({ message: 'Eroare la înregistrarea angajatului', error: error.message });
  }
};

exports.logout = (req, res) => {
  // În funcție de implementarea actuală a autentificării
  // JWT este stateless, deci nu putem "deconecta" un token de pe server
  // Însă putem:
  // 1. Instructa clientul să șteargă token-ul
  // 2. Adăuga token-ul la o blacklist (dacă există o implementare de blacklist)
  
  try {
    // Răspundem cu succes - clientul va șterge token-ul din localStorage
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during logout',
      error: error.message 
    });
  }
};

// Înregistrare administrator (disponibil doar pentru administratori existenți)
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, nume, prenume } = req.body;
    
    // Verificăm dacă emailul este deja înregistrat
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Emailul este deja înregistrat' });
    }
    
    // Criptăm parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Creăm administratorul nou
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      nume,
      prenume,
      userType: 'admin'
    });
    
    // Construim manual obiectul de răspuns pentru a evita probleme cu metoda toJSON
    const adminResponse = {
      id: newAdmin.id,
      email: newAdmin.email,
      userType: newAdmin.userType,
      nume: newAdmin.nume,
      prenume: newAdmin.prenume,
      createdAt: newAdmin.createdAt,
      updatedAt: newAdmin.updatedAt
    };
    
    res.status(201).json({
      message: 'Administrator înregistrat cu succes',
      user: adminResponse
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Eroare la înregistrarea administratorului', error: error.message });
  }
};