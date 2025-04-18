// test-db.js
const { sequelize } = require('./src/models');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a fost stabilită cu succes.');
  } catch (error) {
    console.error('Nu s-a putut conecta la baza de date:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();