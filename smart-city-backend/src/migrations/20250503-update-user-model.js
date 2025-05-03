'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adaugă coloana user_type la tabelul users dacă nu există deja
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.user_type) {
      await queryInterface.addColumn('users', 'user_type', {
        type: Sequelize.ENUM('user', 'employee', 'admin'),
        defaultValue: 'user'
      });
    }
    
    // Adaugă coloana department (string) la tabelul users dacă nu există deja
    // Aceasta este folosită până la migrarea completă la relația cu tabelul departments
    if (!tableInfo.department) {
      await queryInterface.addColumn('users', 'department', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    // Actualizăm toți utilizatorii fără user_type setat
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET user_type = 'user' 
      WHERE user_type IS NULL OR user_type = '';
    `);
    
    // Creează cel puțin un utilizator admin dacă nu există
    const adminCount = await queryInterface.sequelize.query(
      `SELECT COUNT(*) FROM users WHERE user_type = 'admin'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (parseInt(adminCount[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await queryInterface.bulkInsert('users', [{
        prenume: 'Admin',
        nume: 'User',
        email: 'admin@smartcity.com',
        password: hashedPassword,
        user_type: 'admin',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Elimină coloana user_type dacă există
    const tableInfo = await queryInterface.describeTable('users');
    
    if (tableInfo.user_type) {
      await queryInterface.removeColumn('users', 'user_type');
    }
    
    if (tableInfo.department) {
      await queryInterface.removeColumn('users', 'department');
    }
  }
};