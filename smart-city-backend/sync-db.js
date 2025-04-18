const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    // {force: true} va șterge tabelele existente și le va recrea
    // folosește {alter: true} pentru a păstra datele existente
    await sequelize.sync({ alter: true });
    console.log('Modelele au fost sincronizate cu baza de date.');
  } catch (error) {
    console.error('Eroare la sincronizarea modelelor:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();