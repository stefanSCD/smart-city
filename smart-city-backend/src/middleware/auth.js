const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Middleware pentru a verifica dacă utilizatorul este un angajat cu departamentul specificat
exports.isEmployeeInDepartment = (department) => {
  return (req, res, next) => {
    if (req.user.type !== 'employee' || req.user.department !== department) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};