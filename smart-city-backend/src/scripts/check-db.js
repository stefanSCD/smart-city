// scripts/check-db.js
// Script pentru verificarea bazei de date și a structurilor tabelelor

const { sequelize } = require('../src/models');

// Funcție pentru afișarea structurii unui tabel
async function showTableStructure(tableName) {
  try {
    const [result] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n=== Structura tabelului "${tableName}" ===`);
    if (result.length === 0) {
      console.log(`Tabelul "${tableName}" nu există!`);
      return;
    }
    
    console.table(result);
  } catch (error) {
    console.error(`Eroare la obținerea structurii tabelului "${tableName}":`, error);
  }
}

// Funcție pentru afișarea tuturor tabelelor din baza de date
async function showAllTables() {
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\n=== Tabele existente în baza de date ===");
    console.table(tables);
    
    // Verificăm structura tabelelor principale
    for (const table of tables) {
      await showTableStructure(table.table_name);
    }
  } catch (error) {
    console.error("Eroare la obținerea listei de tabele:", error);
  }
}

// Funcție pentru verificarea opțiunilor modelelor
function checkModelsOptions() {
  const db = require('../src/models');
  
  console.log("\n=== Opțiuni modele ===");
  for (const modelName in db) {
    if (db[modelName] && db[modelName].options) {
      console.log(`\nModelul "${modelName}":`);
      console.log(`  - tableName: ${db[modelName].options.tableName || 'nedefinit'}`);
      console.log(`  - timestamps: ${db[modelName].options.timestamps || false}`);
      console.log(`  - paranoid: ${db[modelName].options.paranoid || false}`);
      console.log(`  - underscored: ${db[modelName].options.underscored || false}`);
    }
  }
}

// Funcție principală
async function main() {
  try {
    console.log("=== Verificarea bazei de date și a modelelor ===");
    
    // Verificăm conexiunea la baza de date
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a fost stabilită cu succes.');
    
    // Afișăm toate tabelele și structurile lor
    await showAllTables();
    
    // Verificăm opțiunile modelelor
    checkModelsOptions();
    
    // Închidem conexiunea
    await sequelize.close();
    console.log("\nProcesul de verificare s-a încheiat.");
  } catch (error) {
    console.error('Eroare la verificarea bazei de date:', error);
    process.exit(1);
  }
}

// Executăm funcția principală
main();