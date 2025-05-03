'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('departments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Adaugă coloana department_id în tabelul users
    await queryInterface.addColumn('users', 'department_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Elimină coloana department_id din tabelul users
    await queryInterface.removeColumn('users', 'department_id');
    
    // Elimină tabelul departments
    await queryInterface.dropTable('departments');
  }
};