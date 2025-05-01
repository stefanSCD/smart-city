// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

/**
 * Middleware pentru verificarea și validarea token-ului JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obține headerul de autorizare
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Token de autentificare lipsă' });
    }
    
    // Verifică token-ul
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token invalid sau expirat' });
      }
      
      try {
        // Găsește utilizatorul în baza de date
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          return res.status(403).json({ message: 'Utilizator inexistent' });
        }
        
        // Atașează informațiile utilizatorului la obiectul request
        req.user = {
          id: user.id,
          email: user.email,
          userType: user.userType
        };
        
        next(); // Continuă cererea
      } catch (error) {
        console.error('Error finding user in database:', error);
        return res.status(500).json({ message: 'Eroare la verificarea utilizatorului' });
      }
    });
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({ message: 'Eroare de server la autentificare' });
  }
};

/**
 * Middleware pentru verificarea rolurilor utilizatorului
 * @param {string[]} roles - Rolurile permise
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nu sunteți autentificat' });
    }
    
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Nu aveți permisiunea necesară' });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};