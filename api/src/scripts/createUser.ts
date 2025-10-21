// Script para crear usuario con contraseña hasheada
// Uso: node dist/scripts/createUser.js <username> <email> <password> <role>

import bcrypt from 'bcrypt';
import pool from '../config/database';

const createUser = async (username: string, email: string, password: string, role: string, name?: string) => {
  try {
    const hash = await bcrypt.hash(password, 10);
    
    const [result]: any = await pool.execute(
      `INSERT INTO users (username, email, name, role, password_hash, is_active) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, email, name || username, role, hash]
    );

    console.log(`✅ Usuario creado exitosamente:`);
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creando usuario:', error.message);
    process.exit(1);
  }
};

const [,, username, email, password, role] = process.argv;

if (!username || !email || !password || !role) {
  console.log('Uso: node dist/scripts/createUser.js <username> <email> <password> <role>');
  console.log('Roles: medico, enfermero, enfermera, auxiliar');
  process.exit(1);
}
createUser(username, email, password, role);