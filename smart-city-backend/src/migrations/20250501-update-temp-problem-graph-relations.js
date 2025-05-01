'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificăm structura tabelului TempProblemGraphs
    try {
      const tableInfo = await queryInterface.describeTable('TempProblemGraphs');
      
      // Verificăm dacă există coloana employee_id
      if (tableInfo.employee_id && !tableInfo.user_id) {
        console.log('Actualizare structură TempProblemGraphs...');
        
        // Adăugăm coloana user_id
        await queryInterface.addColumn('TempProblemGraphs', 'user_id', {
          type: Sequelize.UUID,
          allowNull: true
        });
        
        // Copiem datele din employee_id în user_id
        await queryInterface.sequelize.query(`
          UPDATE "TempProblemGraphs" 
          SET "user_id" = "employee_id" 
          WHERE "employee_id" IS NOT NULL
        `);
        
        // Facem coloana user_id NOT NULL dacă este necesar
        if (!tableInfo.employee_id.allowNull) {
          await queryInterface.changeColumn('TempProblemGraphs', 'user_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            }
          });
        }
        
        // Eliminăm coloana employee_id
        await queryInterface.removeColumn('TempProblemGraphs', 'employee_id');
        
        console.log('Actualizare TempProblemGraphs finalizată cu succes.');
      } else if (!tableInfo.user_id) {
        // Dacă nu există nici employee_id, nici user_id, adăugăm user_id
        await queryInterface.addColumn('TempProblemGraphs', 'user_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          }
        });
        
        console.log('Coloana user_id adăugată în TempProblemGraphs.');
      }
    } catch (error) {
      // Dacă tabelul nu există sau apare altă eroare
      console.log('Eroare sau tabelul TempProblemGraphs nu există:', error.message);
    }
    
    // Verificăm dacă există alte relații care trebuie actualizate
    // (adăugați aici alte actualizări specifice, dacă este cazul)
  },

  down: async (queryInterface, Sequelize) => {
    // Revertim schimbările
    try {
      const tableInfo = await queryInterface.describeTable('TempProblemGraphs');
      
      if (tableInfo.user_id && !tableInfo.employee_id) {
        // Adăugăm coloana employee_id
        await queryInterface.addColumn('TempProblemGraphs', 'employee_id', {
          type: Sequelize.UUID,
          allowNull: true
        });
        
        // Copiem datele din user_id în employee_id
        // Dar doar pentru utilizatorii de tip 'employee'
        await queryInterface.sequelize.query(`
          UPDATE "TempProblemGraphs" tpg
          SET "employee_id" = "user_id"
          FROM "Users" u
          WHERE tpg.user_id = u.id AND u.userType = 'employee'
        `);
        
        // Facem coloana employee_id NOT NULL dacă este cazul
        if (!tableInfo.user_id.allowNull) {
          await queryInterface.changeColumn('TempProblemGraphs', 'employee_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Employees',
              key: 'id'
            }
          });
        }
        
        // Eliminăm coloana user_id
        await queryInterface.removeColumn('TempProblemGraphs', 'user_id');
      }
    } catch (error) {
      console.log('Eroare la revenirea la structura anterioară:', error.message);
    }
  }
};