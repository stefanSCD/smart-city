// scripts/create-admin-numeric-id.js
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configurare bază de date
const dbConfig = {
  database: process.env.DB_NAME || 'smart_city_dev',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || '127.0.0.1',
  dialect: 'postgres'
};

async function createAdmin() {
  try {
    console.log('Încercare de conectare la baza de date...');
    
    // Creează o conexiune la baza de date
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false
      }
    );

    // Verifică conexiunea
    await sequelize.authenticate();
    console.log('Conectat la baza de date cu succes.');

    // Verifică dacă există deja un admin cu acest email
    const checkResults = await sequelize.query(
      'SELECT * FROM users WHERE email = :email',
      {
        replacements: { email: 'admin@smartcity.com' },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (checkResults && checkResults.length > 0) {
      console.log('Un admin cu acest email există deja!');
      await sequelize.close();
      return;
    }

    // Verifică ce tip de ID folosește tabela users
    const tableInfo = await sequelize.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name = 'id'`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('Informații despre coloana ID:', tableInfo);

    // Criptează parola
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Generează auto-incrementare ID dacă e necesar (mai sigur)
    const insertSQL = `
      INSERT INTO users (
        email, password, nume, prenume, user_type, 
        created_at, updated_at, active
      ) VALUES (
        :email, :password, :nume, :prenume, 'admin',
        NOW(), NOW(), true
      ) RETURNING id
    `;

    const result = await sequelize.query(insertSQL, {
      replacements: {
        email: 'admin@smartcity.com',
        password: hashedPassword,
        nume: 'Admin',
        prenume: 'System'
      },
      type: sequelize.QueryTypes.INSERT
    });

    console.log('Admin creat cu succes!');
    console.log('ID-ul generat:', result[0][0].id);
    console.log('Email: admin@smartcity.com');
    console.log('Parola: Admin123!');

    await sequelize.close();
  } catch (error) {
    console.error('Eroare la crearea adminului:', error);
  }
}

createAdmin();