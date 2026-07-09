import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initialize() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: '',
  };

  const dbName = 'access_control_db';
  const email = 'admin@contaall.com';
  const password = 'contaall';
  const fullName = 'Administrador Sistema';

  let connection;

  try {
    console.log('Conectando a MySQL...');
    connection = await mysql.createConnection(config);

    console.log(`Creando base de datos '${dbName}' si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`USE ${dbName}`);

    console.log('Ejecutando esquema (schema.sql)...');
    const schemaPath = path.join(__dirname, 'db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema by semicolon to execute one by one (basic split)
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.toLowerCase().startsWith('use ')) continue;
      await connection.query(statement);
    }

    console.log(`Creando usuario administrador: ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const profileId = uuidv4();
    const roleId = uuidv4();

    // Check if user already exists
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('El usuario administrador ya existe.');
    } else {
      // Insert user
      await connection.execute(
        'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
        [userId, email, hashedPassword]
      );

      // Insert profile
      await connection.execute(
        'INSERT INTO profiles (id, user_id, full_name, email) VALUES (?, ?, ?, ?)',
        [profileId, userId, fullName, email]
      );

      // Assign admin role
      await connection.execute(
        'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
        [roleId, userId, 'admin']
      );

      console.log('-----------------------------------');
      console.log('¡Inicialización completada con éxito!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('-----------------------------------');
    }

  } catch (error) {
    console.error('Error durante la inicialización:', error);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

initialize();
