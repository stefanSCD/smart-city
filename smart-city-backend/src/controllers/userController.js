const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Obține toți utilizatorii
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Nu includem parola în răspuns
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// Obține un utilizator după ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

// Creează un utilizator nou
exports.createUser = async (req, res) => {
  try {
    // Hash parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const userData = {
      ...req.body,
      password: hashedPassword
    };
    
    const newUser = await User.create(userData);
    
    // Nu trimitem parola înapoi
    const { password, ...userWithoutPassword } = newUser.toJSON();
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Actualizează un utilizator
exports.updateUser = async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Dacă se actualizează parola, hash-o
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    const updated = await User.update(userData, {
      where: { id: req.params.id }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Șterge un utilizator
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Obține problemele unui utilizator
exports.getUserProblems = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Problem }],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.Problems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user problems', error: error.message });
  }
};