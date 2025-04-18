const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de bază
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(helmet()); // Adaugă headers de securitate
app.use(morgan('dev')); // Logging pentru dezvoltare

// Ruta principală
app.get('/', (req, res) => {
  res.send('Smart City API is running');
});

// Încărcarea rutelor API
try {
  // Încărcăm toate rutele
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/problems', require('./routes/problemRoutes'));
  app.use('/api/employees', require('./routes/employeeRoutes'));
  app.use('/api/auth', require('./routes/authRoutes'));
  
  console.log('Toate rutele au fost încărcate cu succes');
} catch (error) {
  console.error('Eroare la încărcarea rutelor:', error);
}

// Middleware pentru tratarea erorilor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'A apărut o eroare pe server', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Pornirea serverului
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sincronizăm modelele cu baza de date
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
});