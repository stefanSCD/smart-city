'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifică dacă tabelul ProblemEmployees există
    try {
      const tableInfo = await queryInterface.describeTable('ProblemEmployees');
      
      // Dacă există, actualizează cheile străine
      if (tableInfo.employee_id) {
        // Crează o coloană temporară pentru a stoca valorile existente
        await queryInterface.addColumn('ProblemEmployees', 'temp_user_id', {
          type: Sequelize.UUID,
          allowNull: true
        });
        
        // Copie datele din employee_id în temp_user_id
        const records = await queryInterface.sequelize.query(
          'SELECT problem_id, employee_id FROM "ProblemEmployees"',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        for (const record of records) {
          // Găsește ID-ul utilizatorului echivalent din tabelul Users
          const [employee] = await queryInterface.sequelize.query(
            'SELECT id FROM "Users" WHERE "id" = :id AND "userType" = \'employee\'',
            { 
              replacements: { id: record.employee_id },
              type: queryInterface.sequelize.QueryTypes.SELECT 
            }
          );
          
          if (employee) {
            await queryInterface.sequelize.query(
              'UPDATE "ProblemEmployees" SET "temp_user_id" = :userId WHERE "problem_id" = :problemId AND "employee_id" = :employeeId',
              { 
                replacements: { 
                  userId: employee.id,
                  problemId: record.problem_id,
                  employeeId: record.employee_id
                }
              }
            );
          }
        }
        
        // Elimină coloana employee_id
        await queryInterface.removeColumn('ProblemEmployees', 'employee_id');
        
        // Adaugă noua coloană user_id
        await queryInterface.addColumn('ProblemEmployees', 'user_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          }
        });
        
        // Copie datele din temp_user_id în user_id
        await queryInterface.sequelize.query(
          'UPDATE "ProblemEmployees" SET "user_id" = "temp_user_id"'
        );
        
        // Elimină coloana temporară
        await queryInterface.removeColumn('ProblemEmployees', 'temp_user_id');
      }
    } catch (error) {
      console.log('Tabelul ProblemEmployees nu există sau a apărut o eroare:', error);
      
      // Dacă tabelul nu există, creează-l
      await queryInterface.createTable('ProblemEmployees', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        problem_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Problems',
            key: 'id'
          }
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      
      // Adaugă index-uri pentru performanță
      await queryInterface.addIndex('ProblemEmployees', ['problem_id']);
      await queryInterface.addIndex('ProblemEmployees', ['user_id']);
      await queryInterface.addIndex('ProblemEmployees', ['problem_id', 'user_id'], { unique: true });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Verifică dacă tabelul ProblemEmployees există
    try {
      const tableInfo = await queryInterface.describeTable('ProblemEmployees');
      
      // Dacă există și are coloana user_id, refacem structura anterioară
      if (tableInfo.user_id) {
        // Crează o coloană temporară pentru a stoca valorile existente
        await queryInterface.addColumn('ProblemEmployees', 'temp_employee_id', {
          type: Sequelize.UUID,
          allowNull: true
        });
        
        // Copie datele din user_id în temp_employee_id
        const records = await queryInterface.sequelize.query(
          'SELECT problem_id, user_id FROM "ProblemEmployees"',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        for (const record of records) {
          // Verifică dacă utilizatorul este de tip employee
          const [user] = await queryInterface.sequelize.query(
            'SELECT id FROM "Users" WHERE "id" = :id AND "userType" = \'employee\'',
            { 
              replacements: { id: record.user_id },
              type: queryInterface.sequelize.QueryTypes.SELECT 
            }
          );
          
          if (user) {
            await queryInterface.sequelize.query(
              'UPDATE "ProblemEmployees" SET "temp_employee_id" = :employeeId WHERE "problem_id" = :problemId AND "user_id" = :userId',
              { 
                replacements: { 
                  employeeId: user.id,
                  problemId: record.problem_id,
                  userId: record.user_id
                }
              }
            );
          }
        }
        
        // Elimină coloana user_id
        await queryInterface.removeColumn('ProblemEmployees', 'user_id');
        
        // Adaugă noua coloană employee_id
        await queryInterface.addColumn('ProblemEmployees', 'employee_id', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Employees',
            key: 'id'
          }
        });
        
        // Copie datele din temp_employee_id în employee_id
        await queryInterface.sequelize.query(
          'UPDATE "ProblemEmployees" SET "employee_id" = "temp_employee_id"'
        );
        
        // Elimină coloana temporară
        await queryInterface.removeColumn('ProblemEmployees', 'temp_employee_id');
      }
    } catch (error) {
      console.log('Eroare la revenirea la structura anterioară:', error);
      
      // Dacă tabelul nu există, înseamnă că a fost creat de această migrare
      // și îl putem elimina complet
      await queryInterface.dropTable('ProblemEmployees');
    }
  }
};