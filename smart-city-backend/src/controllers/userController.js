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

    // Actualizează utilizatorul cu noul avatar
    await User.update(
      { avatar: avatarUrl },
      { where: { id: userId } }
    );

    // Obține utilizatorul actualizat
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    // Formatează răspunsul
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
    const userId = req.user.id; // ID-ul utilizatorului din token
    const { oldPassword, newPassword } = req.body;

    // Verificăm dacă utilizatorul există
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificăm parola veche
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Hash noua parolă
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizăm parola utilizatorului
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

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

// Obține rapoartele recente ale unui utilizator
exports.getUserRecentReports = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(`Starting getUserRecentReports with userId: ${userId}`);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Modificarea este aici - folosește "createdAt" în loc de "created_at" pentru ORDER BY
    const recentReports = await Problem.findAll({
      where: {
        reported_by: userId
      },
      order: [
        ['createdAt', 'DESC'] // Folosim createdAt în loc de created_at
      ],
      limit: 5
    });

    return res.status(200).json(recentReports);
  } catch (error) {
    console.error('Error in getUserRecentReports:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
// Actualizează un utilizator
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Obține ID-ul din token
    const { name, email, phone } = req.body;
    
    // Separă numele complet în nume și prenume
    const nameParts = name.split(' ');
    const prenume = nameParts[0] || '';
    const nume = nameParts.slice(1).join(' ') || '';
    
    // Actualizează utilizatorul
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
    
    // Obține utilizatorul actualizat
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    // Formatează datele pentru răspuns (pentru a se potrivi cu așteptările frontend-ului)
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

// Obține notificările unui utilizator
exports.getUserNotifications = async (req, res) => {
  try {
    console.log('Starting getUserNotifications with userId:', req.query.userId);
    
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    
    // Verifică dacă utilizatorul există
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Obține notificările utilizatorului
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

// Obține profilul unui utilizator
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Găsește utilizatorul
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Formatează datele pentru răspuns
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
    const userId = req.params.id;
    
    // Obține problemele utilizatorului direct
    const problems = await Problem.findAll({
      where: { reported_by: userId }, // Folosește numele corect al coloanei
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