import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from './lib/db.js';

async function addUser() {
  const email = 'aguadojose20@gmail.com';
  const password = 'joseaguilar';
  const fullName = 'Jose Aguado';

  console.log(`Intentando agregar usuario: ${email}...`);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const profileId = uuidv4();
    const roleId = uuidv4();

    // Insertar usuario
    await pool.execute(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );

    // Insertar perfil
    await pool.execute(
      'INSERT INTO profiles (id, user_id, full_name, email) VALUES (?, ?, ?, ?)',
      [profileId, userId, fullName, email]
    );

    // Asignar rol admin (asumiendo que quiere ser admin)
    await pool.execute(
      'INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)',
      [roleId, userId, 'admin']
    );

    console.log('-----------------------------------');
    console.log('¡Usuario agregado con éxito!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('El usuario ya existe en la base de datos.');
    } else {
      console.error('Error agregando el usuario:', error);
    }
  } finally {
    process.exit();
  }
}

addUser();
