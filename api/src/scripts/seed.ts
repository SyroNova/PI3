// Script para seed de datos de prueba
import bcrypt from 'bcrypt';
import pool from '../config/database';

const seed = async () => {
  const conn = await pool.getConnection();
  try {
    console.log('🌱 Iniciando seed de datos de prueba...');

    await conn.beginTransaction();

    // 1. Crear usuarios de prueba
    const adminHash = await bcrypt.hash('admin123', 10);
    const medicoHash = await bcrypt.hash('medico123', 10);

    await conn.execute(
      `INSERT INTO users (username, email, name, role, password_hash, is_active) 
       VALUES 
       ('admin', 'admin@electromed.local', 'Administrador Sistema', 'admin', ?, 1),
       ('dr.lopez', 'dr.lopez@electromed.local', 'Dr. Juan López', 'medico', ?, 1)
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      [adminHash, medicoHash]
    );
    console.log('✅ Usuarios creados: admin, dr.lopez');

    // 2. Crear pacientes de prueba
    const patients = [
      ['1234567890', 'Juan', 'Carlos', 'Pérez', 'García', 'Masculino', '1985-05-15', 45, '3001234567', 'juan.perez@example.com', 'Antioquia', 'Medellín', 'EPS Sura'],
      ['0987654321', 'María', 'Fernanda', 'González', 'Torres', 'Femenino', '1992-08-22', 32, '3109876543', 'maria.gonzalez@example.com', 'Cundinamarca', 'Bogotá', 'Compensar'],
      ['1122334455', 'Pedro', null, 'Ramírez', 'Soto', 'Masculino', '1978-12-10', 46, '3156789012', 'pedro.ramirez@example.com', 'Valle del Cauca', 'Cali', 'Sanitas']
    ];

    for (const p of patients) {
      await conn.execute(
        `INSERT INTO patients 
         (identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
          sexo, fecha_nacimiento, edad, telefono, correo, departamento, ciudad, eps)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE primer_nombre = VALUES(primer_nombre)`,
        p
      );
    }
    console.log('✅ 3 pacientes creados');

    // 3. Crear hospitalizaciones
    const [patientsRows]: any = await conn.execute('SELECT id FROM patients LIMIT 3');
    const patientIds = patientsRows.map((r: any) => r.id);

    const hospitalizations = [
      [patientIds[0], '2025-10-18', 'uci', '101', 'Hipertensión arterial severa', 'Penicilina', 'Enalapril 10mg', 'Control de presión arterial elevada', 1],
      [patientIds[1], '2025-10-19', 'urgencias', '205', 'Gastroenteritis aguda', 'Ninguna', 'Suero oral', 'Deshidratación moderada', 1],
      [patientIds[2], '2025-10-20', 'hospitalizacion', '310', 'Diabetes mellitus tipo 2 descompensada', 'Aspirina', 'Metformina 850mg', 'Hiperglucemia', 1]
    ];

    for (const h of hospitalizations) {
      await conn.execute(
        `INSERT INTO hospitalizations 
         (patient_id, fecha_ingreso, planta, habitacion, diagnostico, alergias, medicamentos, motivo, created_by)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        h
      );
    }
    console.log('✅ 3 hospitalizaciones creadas');

    // 4. Crear exámenes de electrolitos
    const [hospRows]: any = await conn.execute('SELECT id, patient_id FROM hospitalizations LIMIT 3');
    
    for (const hosp of hospRows) {
      await conn.execute(
        `INSERT INTO electrolyte_tests 
         (patient_id, hospitalization_id, exam_date, planta, sodio, potasio, cloro, alertas, created_by)
         VALUES 
         (?, ?, CURDATE(), 'uci', 140.5, 4.2, 101.0, JSON_ARRAY('normal'), 1),
         (?, ?, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'uci', 138.0, 5.8, 99.0, JSON_ARRAY('hiperkalemia'), 1)`,
        [hosp.patient_id, hosp.id, hosp.patient_id, hosp.id]
      );
    }
    console.log('✅ Exámenes de electrolitos creados');

    await conn.commit();
    console.log('🎉 Seed completado exitosamente');
    process.exit(0);
  } catch (error: any) {
    await conn.rollback();
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  } finally {
    conn.release();
  }
};

seed();
