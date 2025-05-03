'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Schimbă tipul coloanei user_id la UUID
    await queryInterface.changeColumn('problem_employees', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false
    });

    // Opțional: Schimbă și problem_id dacă și acesta este UUID
    await queryInterface.changeColumn('problem_employees', 'problem_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revenire la tipul original
    await queryInterface.changeColumn('problem_employees', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    // Opțional: Revenire pentru problem_id
    await queryInterface.changeColumn('problem_employees', 'problem_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};