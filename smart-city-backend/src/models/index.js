const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

// Creează instanța Sequelize
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: 'postgres',
    logging: config.logging
  }
);

// Definește modelele
const db = {
  sequelize,
  Sequelize
};

// Importă modelele (atenție la ordine)
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Employee = require('./Employee')(sequelize, Sequelize.DataTypes);
db.Problem = require('./Problem')(sequelize, Sequelize.DataTypes);
db.TempProblemGraph = require('./TempProblemGraph')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);

// Configurează asocierile după ce toate modelele sunt încărcate
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sincronizează modelele cu baza de date
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synchronized');
    
    // Crează date de test pentru notificări
    try {
      // Verifică dacă avem deja notificări
      const notificationCount = await db.Notification.count();
      if (notificationCount === 0) {
        console.log('No notifications found. Creating test data...');
        
        // Obține toți utilizatorii
        const users = await db.User.findAll();
        
        if (users.length > 0) {
          // Crează notificări pentru fiecare utilizator
          for (const user of users) {
            await db.Notification.bulkCreate([
              { 
                user_id: user.id, 
                message: 'Bine ai venit în aplicația Smart City!', 
                is_read: false, 
                date: 'Acum',
                created_at: new Date() 
              },
              { 
                user_id: user.id, 
                message: 'Raportul tău a fost primit cu succes', 
                is_read: false, 
                date: 'Ieri',
                created_at: new Date(Date.now() - 86400000) 
              }
            ]);
          }
          console.log('Test notifications created successfully');
        } else {
          console.log('No users found. Skipping notification creation.');
        }
      } else {
        console.log('Notifications already exist. Skipping creation.');
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
    }
  })
  .catch(err => {
    console.error('Database synchronization error:', err);
  });
  
module.exports = db;