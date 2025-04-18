// src/middleware/errorHandler.js
const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl
  });

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};