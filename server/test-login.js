#!/usr/bin/env node

/**
 * Script para probar el endpoint de login
 * Uso: node test-login.js <email> <password>
 * Ejemplo: node test-login.js operador1@contall.com password123
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = process.env.VITE_API_URL || 'http://localhost:8081/api';
const API_BASE = 'http://localhost:8081/api';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('❌ Por favor proporciona email y contraseña');
  console.log('\nUso: node test-login.js <email> <password>');
  console.log('Ejemplo: node test-login.js operador1@contall.com password123\n');
  process.exit(1);
}

const email = args[0];
const password = args[1];

async function testLogin() {
  console.log('🧪 Probando endpoint de login...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🔐 Contraseña: ${'*'.repeat(password.length)}`);
  console.log(`🌐 URL API: ${API_BASE}\n`);

  try {
    console.log('📤 Enviando solicitud de login...\n');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Error [${response.status}]: ${data.error || 'Unknown error'}\n`);
      console.log('📋 Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ ¡Login exitoso!\n');
    console.log('📋 Datos de respuesta:');
    console.log(JSON.stringify(data, null, 2));

    if (data.token) {
      console.log(`\n🔑 Token (primeros 50 caracteres):`);
      console.log(data.token.substring(0, 50) + '...');
    }

    console.log('\n✅ Prueba completada correctamente');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('  1. El servidor está ejecutándose en puerto 8081');
    console.log('  2. La base de datos está disponible');
    console.log('  3. El usuario existe en la base de datos\n');
    process.exit(1);
  }
}

testLogin();
