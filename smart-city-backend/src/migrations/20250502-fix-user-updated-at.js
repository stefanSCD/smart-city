'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Primul pas: adăugăm coloana updated_at ca NULL pentru a putea actualiza valorile
      await queryInterface.addColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      // Al doilea pas: setăm updated_at = created_at pentru toate înregistrările
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
      `);
      
      // Al treilea pas: modificăm coloana pentru a o face NOT NULL
      await queryInterface.changeColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'updated_at');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};