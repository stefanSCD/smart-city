// Importuri corecte la începutul fișierului
const { User, Problem, Notification } = require('../models');
const bcrypt = require('bcryptjs');

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const avatarUrl = `/images/avatars/${req.file.filename}`;

    await User.update(
      { avatar: avatarUrl },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    const formattedUser = {
      id: updatedUser.id,
      name: `${updatedUser.prenume} ${updatedUser.nume}`.trim(),
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone || ''
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

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

exports.createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const userData = {
      ...req.body,
      password: hashedPassword
    };
    
    const newUser = await User.create(userData);
    
    const { password, ...userWithoutPassword } = newUser.toJSON();
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

exports.getUserRecentReports = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(`Starting getUserRecentReports with userId: ${userId}`);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const recentReports = await Problem.findAll({
      where: {
        reported_by: userId
      },
      order: [
        ['createdAt', 'DESC'] 
      ],
      limit: 5
    });

    return res.status(200).json(recentReports);
  } catch (error) {
    console.error('Error in getUserRecentReports:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;
    
    const nameParts = name.split(' ');
    const prenume = nameParts[0] || '';
    const nume = nameParts.slice(1).join(' ') || '';
    
    const updated = await User.update(
      {
        nume: nume,
        prenume: prenume,
        email: email,
        phone: phone
      },
      {
        where: { id: userId }
      }
    );
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    const formattedUser = {
      id: updatedUser.id,
      name: `${updatedUser.prenume} ${updatedUser.nume}`.trim(),
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone || ''
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: 'Error updating user profile', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const formattedUser = {
      id: user.id,
      name: `${user.prenume} ${user.nume}`.trim(),
      email: user.email,
      avatar: user.avatar || '/images/default-avatar.jpg',
      phone: user.phone || ''
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

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

exports.getUserProblems = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const problems = await Problem.findAll({
      where: { reported_by: userId },
      order: [['created_at', 'DESC']]
    });
    
    if (!problems) {
      return res.status(404).json({ message: 'No problems found for this user' });
    }
    
    res.json(problems);
  } catch (error) {
    console.error('Error retrieving user problems:', error);
    res.status(500).json({ message: 'Error retrieving user problems', error: error.message });
  }
};