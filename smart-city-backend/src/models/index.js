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

// Importă modelele principale
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Problem = require('./Problem')(sequelize, Sequelize.DataTypes);
db.TempProblemGraph = require('./TempProblemGraph')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);

// Proxy pentru Employee (redirecționează către User cu userType = 'employee')
db.Employee = {
  findAll: (options = {}) => {
    return db.User.findAll({
      ...options,
      where: {
        ...options.where,
        userType: 'employee'
      }
    });
  },
  findOne: (options = {}) => {
    return db.User.findOne({
      ...options,
      where: {
        ...options.where,
        userType: 'employee'
      }
    });
  },
  findByPk: (id, options = {}) => {
    return db.User.findOne({
      ...options,
      where: {
        id,
        userType: 'employee'
      }
    });
  },
  create: (data, options = {}) => {
    return db.User.create({
      ...data,
      userType: 'employee'
    }, options);
  },
  update: (data, options = {}) => {
    return db.User.update(data, {
      ...options,
      where: {
        ...options.where,
        userType: 'employee'
      }
    });
  },
  destroy: (options = {}) => {
    return db.User.destroy({
      ...options,
      where: {
        ...options.where,
        userType: 'employee'
      }
    });
  },
  // Pentru asocieri
  associations: {},
  tableName: 'Users',
  rawAttributes: db.User.rawAttributes,
  options: db.User.options,
  modelName: 'Employee',
  // Adăugăm un flag pentru a indica că acesta este un model proxy
  _isProxy: true
};

// Proxy pentru Admin (redirecționează către User cu userType = 'admin')
db.Admin = {
  findAll: (options = {}) => {
    return db.User.findAll({
      ...options,
      where: {
        ...options.where,
        userType: 'admin'
      }
    });
  },
  findOne: (options = {}) => {
    return db.User.findOne({
      ...options,
      where: {
        ...options.where,
        userType: 'admin'
      }
    });
  },
  findByPk: (id, options = {}) => {
    return db.User.findOne({
      ...options,
      where: {
        id,
        userType: 'admin'
      }
    });
  },
  create: (data, options = {}) => {
    return db.User.create({
      ...data,
      userType: 'admin'
    }, options);
  },
  update: (data, options = {}) => {
    return db.User.update(data, {
      ...options,
      where: {
        ...options.where,
        userType: 'admin'
      }
    });
  },
  destroy: (options = {}) => {
    return db.User.destroy({
      ...options,
      where: {
        ...options.where,
        userType: 'admin'
      }
    });
  },
  // Pentru asocieri
  associations: {},
  tableName: 'Users',
  rawAttributes: db.User.rawAttributes,
  options: db.User.options,
  modelName: 'Admin',
  // Adăugăm un flag pentru a indica că acesta este un model proxy
  _isProxy: true
};

// Configurează asocierile după ce toate modelele sunt încărcate
Object.keys(db).forEach(modelName => {
  // Verificăm dacă modelul are metoda associate și nu este un proxy
  if (db[modelName].associate && typeof db[modelName].associate === 'function' && !db[modelName]._isProxy) {
    db[modelName].associate(db);
  }
});

// Sincronizează modelele cu baza de date
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully');
    
    try {
      // Crează date de test pentru notificări (sau alte inițializări)
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
      console.error('Error creating test data:', error);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
  
module.exports = db;