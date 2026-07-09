import pool from './lib/db.js';

async function checkSchema() {
  try {
    const [columns] = await pool.execute('DESCRIBE persons');
    console.log('ESTRUCTURA DE TABLA PERSONS:');
    console.table(columns);
  } catch (error) {
    console.error('ERROR AL VERIFICAR ESQUEMA:', error.message);
  } finally {
    process.exit();
  }
}

checkSchema();
