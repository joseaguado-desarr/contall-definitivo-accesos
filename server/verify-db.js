import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verifyDatabase() {
  console.log('🔍 Verificando configuración de la base de datos...\n');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'access_control_db',
  };

  console.log('📋 Configuración actual:');
  console.log(`  - Host: ${dbConfig.host}`);
  console.log(`  - User: ${dbConfig.user}`);
  console.log(`  - Database: ${dbConfig.database}\n`);

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a la base de datos: EXITOSA\n');

    // Verify tables
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [dbConfig.database]
    );

    console.log('📊 Tablas en la base de datos:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // Check users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Usuarios registrados: ${users[0].count}`);

    if (users[0].count > 0) {
      const [userList] = await connection.execute('SELECT id, email FROM users LIMIT 3');
      console.log('   Primeros usuarios:');
      userList.forEach(user => {
        console.log(`     - ${user.email} (ID: ${user.id})`);
      });
    }

    // Check profiles
    const [profiles] = await connection.execute('SELECT COUNT(*) as count FROM profiles');
    console.log(`\n👤 Perfiles: ${profiles[0].count}`);

    // Check user_roles
    const [roles] = await connection.execute('SELECT COUNT(*) as count FROM user_roles');
    console.log(`🎭 Roles de usuarios: ${roles[0].count}`);

    // Check for mismatches
    console.log('\n🔎 Verificando integridad referencial...');
    const [orphanedProfiles] = await connection.execute(
      'SELECT p.id, p.user_id FROM profiles p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL'
    );

    if (orphanedProfiles.length > 0) {
      console.log(`⚠️  Se encontraron ${orphanedProfiles.length} perfiles huérfanos`);
    } else {
      console.log('✅ Todos los perfiles están vinculados a usuarios');
    }

    const [orphanedRoles] = await connection.execute(
      'SELECT r.id, r.user_id FROM user_roles r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL'
    );

    if (orphanedRoles.length > 0) {
      console.log(`⚠️  Se encontraron ${orphanedRoles.length} roles huérfanos`);
    } else {
      console.log('✅ Todos los roles están vinculados a usuarios');
    }

    // Check for users without profiles or roles
    const [usersWithoutProfiles] = await connection.execute(
      'SELECT u.id, u.email FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE p.id IS NULL'
    );

    if (usersWithoutProfiles.length > 0) {
      console.log(`\n⚠️  Se encontraron ${usersWithoutProfiles.length} usuarios sin perfil`);
      usersWithoutProfiles.forEach(user => {
        console.log(`     - ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ Todos los usuarios tienen perfil');
    }

    const [usersWithoutRoles] = await connection.execute(
      'SELECT u.id, u.email FROM users u LEFT JOIN user_roles r ON u.id = r.user_id WHERE r.id IS NULL'
    );

    if (usersWithoutRoles.length > 0) {
      console.log(`\n⚠️  Se encontraron ${usersWithoutRoles.length} usuarios sin rol`);
      usersWithoutRoles.forEach(user => {
        console.log(`     - ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ Todos los usuarios tienen rol asignado');
    }

    console.log('\n✅ Verificación completada');
    await connection.end();
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
