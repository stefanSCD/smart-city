'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adăugăm câmpul userType la tabelul Users
    await queryInterface.addColumn('Users', 'userType', {
      type: Sequelize.ENUM('user', 'employee', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    });

    // Adăugăm câmpul department
    await queryInterface.addColumn('Users', 'department', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Adăugăm câmpul position
    await queryInterface.addColumn('Users', 'position', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Adăugăm câmpul lastLogin
    await queryInterface.addColumn('Users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Modificăm utilizatorii existenți pentru a avea userType = 'user'
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET "userType" = 'user'
    `);

    // Importăm datele din tabelul Employees (dacă există)
    try {
      const employees = await queryInterface.sequelize.query(
        'SELECT * FROM "Employees"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Pentru fiecare angajat, creăm un user cu userType = 'employee'
      for (const employee of employees) {
        await queryInterface.sequelize.query(`
          INSERT INTO "Users" (
            "email", "password", "nume", "prenume", "userType", "department", "position", "createdAt", "updatedAt"
          ) VALUES (
            '${employee.email}', 
            '${employee.password}', 
            '${employee.nume}', 
            '${employee.prenume}', 
            'employee', 
            '${employee.department || ''}', 
            '${employee.position || ''}', 
            NOW(), 
            NOW()
          )
        `);
      }
    } catch (error) {
      console.log('Tabelul Employees nu există sau a apărut o eroare:', error);
    }

    // Importăm datele din tabelul Admins (dacă există)
    try {
      const admins = await queryInterface.sequelize.query(
        'SELECT * FROM "Admins"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Pentru fiecare admin, creăm un user cu userType = 'admin'
      for (const admin of admins) {
        await queryInterface.sequelize.query(`
          INSERT INTO "Users" (
            "email", "password", "nume", "prenume", "userType", "createdAt", "updatedAt"
          ) VALUES (
            '${admin.email}', 
            '${admin.password}', 
            '${admin.nume}', 
            '${admin.prenume}', 
            'admin', 
            NOW(), 
            NOW()
          )
        `);
      }
    } catch (error) {
      console.log('Tabelul Admins nu există sau a apărut o eroare:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminăm câmpurile adăugate
    await queryInterface.removeColumn('Users', 'userType');
    await queryInterface.removeColumn('Users', 'department');
    await queryInterface.removeColumn('Users', 'position');
    await queryInterface.removeColumn('Users', 'lastLogin');
    
    // Eliminăm tipul ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_userType";');
  }
};