const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

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

// Configurează asocierile după ce toate modelele sunt încărcate
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;