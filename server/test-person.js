import pool from './lib/db.js';
import { v4 as uuidv4 } from 'uuid';

async function testCreatePerson() {
  const id = uuidv4();
  const person = {
    first_name: 'Test',
    last_name: 'User',
    document: '123456789' + Math.floor(Math.random() * 1000),
    type: 'resident',
    phone: '123456789',
    email: 'test@example.com',
    unit: '101',
    notes: 'Test notes',
    photo_url: null,
    status: 'active'
  };

  try {
    console.log('Intentando crear persona de prueba...');
    await pool.execute(
      'INSERT INTO persons (id, first_name, last_name, document, type, phone, email, unit, notes, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, person.first_name, person.last_name, person.document, person.type, person.phone, person.email, person.unit, person.notes, person.photo_url, person.status]
    );
    console.log('¡Persona creada con éxito!');
  } catch (error) {
    console.error('ERROR CREANDO PERSONA:', error.message);
    console.error('Detalles del error:', error);
  } finally {
    process.exit();
  }
}

testCreatePerson();
