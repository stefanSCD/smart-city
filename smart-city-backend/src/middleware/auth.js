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
        // Găsește utilizatorul în baza de date folosind findOne în loc de findByPk
        // pentru a evita problemele cu coloana deleted_at
        const user = await User.findOne({
          where: { id: decoded.id },
          attributes: { exclude: ['password'] } // Nu aducem parola
        });
        
        if (!user) {
          return res.status(403).json({ message: 'Utilizator inexistent' });
        }
        
        // Atașează informațiile utilizatorului la obiectul request
        req.user = {
          id: user.id,
          email: user.email,
          userType: user.userType || 'user' // Valoare implicită în caz că nu există
        };
        
        next(); // Continuă cererea
      } catch (error) {
        console.error('Error finding user in database:', error);
        
        // Dacă eroarea este legată de coloana deleted_at, continuăm cu datele din token
        if (error.message && error.message.includes('deleted_at')) {
          console.log('Bypassing database check due to deleted_at error');
          
          // Folosim direct informațiile din token
          req.user = {
            id: decoded.id,
            email: decoded.email || decoded.user?.email,
            userType: decoded.type || decoded.user?.type || 'user'
          };
          
          next(); // Continuă cererea
        } else {
          return res.status(500).json({ message: 'Eroare la verificarea utilizatorului', error: error.message });
        }
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