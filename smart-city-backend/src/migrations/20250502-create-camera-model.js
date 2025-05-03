'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cameras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'maintenance', 'inactive'),
        defaultValue: 'active'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      stream_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ai_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      thumbnail: {
        type: Sequelize.STRING,
        defaultValue: '/api/placeholder/320/180'
      },
      detections: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cameras');
  }
};