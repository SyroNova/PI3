-- ElectroMed - Complete Database Setup
-- Incluye: Schema original + tabla user_devices para notificaciones push
-- Ejecutar este archivo completo en MySQL

-- Create database
CREATE DATABASE IF NOT EXISTS electromed
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE electromed;

-- Users table: authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username        VARCHAR(64)      NOT NULL,
  email           VARCHAR(255)     NULL,
  name            VARCHAR(120)     NULL,
  role            ENUM('medico','enfermeria','auxiliar') NOT NULL DEFAULT 'medico',
  password_hash   VARCHAR(255)     NOT NULL,
  is_active       TINYINT(1)       NOT NULL DEFAULT 1,
  last_login_at   DATETIME         NULL,
  created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password reset requests (for recovery flow)
CREATE TABLE IF NOT EXISTS password_resets (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NULL,
  email         VARCHAR(255)    NOT NULL,
  code          VARCHAR(12)     NOT NULL,
  expires_at    DATETIME        NOT NULL,
  used_at       DATETIME        NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pwres_email_code (email, code),
  KEY idx_pwres_expires (expires_at),
  CONSTRAINT fk_pwres_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Patients master data
CREATE TABLE IF NOT EXISTS patients (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  identificacion     VARCHAR(32)     NOT NULL,
  primer_nombre      VARCHAR(80)     NOT NULL,
  segundo_nombre     VARCHAR(80)     NULL,
  primer_apellido    VARCHAR(80)     NOT NULL,
  segundo_apellido   VARCHAR(80)     NULL,
  sexo               ENUM('Masculino','Femenino') NOT NULL,
  fecha_nacimiento   DATE            NULL,
  edad               TINYINT UNSIGNED NULL,
  telefono           VARCHAR(32)     NULL,
  correo             VARCHAR(255)    NULL,
  departamento       VARCHAR(80)     NULL,
  ciudad             VARCHAR(80)     NULL,
  eps                VARCHAR(120)    NULL,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_patients_identificacion (identificacion),
  KEY idx_patients_nombre_apellido (primer_nombre, primer_apellido),
  KEY idx_patients_ciudad (ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Hospitalizations (Admissions)
CREATE TABLE IF NOT EXISTS hospitalizations (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id       BIGINT UNSIGNED NOT NULL,
  fecha_ingreso    DATE            NOT NULL,
  planta           ENUM('uci','urgencias','hospitalizacion') NOT NULL,
  habitacion       VARCHAR(50)     NULL,
  diagnostico      VARCHAR(255)    NULL,
  alergias         TEXT            NULL,
  medicamentos     TEXT            NULL,
  motivo           TEXT            NOT NULL,
  estado           ENUM('activa','cerrada') NOT NULL DEFAULT 'activa',
  created_by       BIGINT UNSIGNED NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_hosp_patient (patient_id),
  KEY idx_hosp_planta_fecha (planta, fecha_ingreso),
  CONSTRAINT fk_hosp_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_hosp_user FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Discharges (Altas)
CREATE TABLE IF NOT EXISTS discharges (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hospitalization_id BIGINT UNSIGNED NOT NULL,
  fecha_alta         DATE            NOT NULL,
  motivo             ENUM('mejoria','remision','voluntario','fallecimiento') NOT NULL,
  tipo_egreso        VARCHAR(100)    NOT NULL,
  destino            ENUM('domicilio','ambulatorio','rehabilitacion','otra_institucion') NOT NULL,
  epicrisis          TEXT            NULL,
  indicaciones       TEXT            NULL,
  responsable        VARCHAR(120)    NULL,
  reingreso_riesgo   ENUM('bajo','medio','alto') NULL,
  observaciones      TEXT            NULL,
  created_by         BIGINT UNSIGNED NULL,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_discharge_hosp (hospitalization_id),
  KEY idx_discharge_fecha (fecha_alta),
  CONSTRAINT fk_discharge_hosp FOREIGN KEY (hospitalization_id) REFERENCES hospitalizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_discharge_user FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Electrolyte test results (Panel/Reportes)
CREATE TABLE IF NOT EXISTS electrolyte_tests (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id         BIGINT UNSIGNED NOT NULL,
  hospitalization_id BIGINT UNSIGNED NULL,
  exam_date          DATE            NOT NULL,
  planta             ENUM('uci','urgencias','hospitalizacion') NOT NULL,
  sodio              DECIMAL(5,2)    NULL,
  potasio            DECIMAL(4,2)    NULL,
  cloro              DECIMAL(5,2)    NULL,
  alertas            JSON            NULL,
  created_by         BIGINT UNSIGNED NULL,
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_el_patient_date (patient_id, exam_date),
  KEY idx_el_planta_date (planta, exam_date),
  CONSTRAINT fk_el_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_el_hosp FOREIGN KEY (hospitalization_id) REFERENCES hospitalizations(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_el_user FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_alertas_json CHECK (JSON_VALID(alertas))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User devices for push notifications (NEW)
CREATE TABLE IF NOT EXISTS user_devices (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  token       VARCHAR(256)    NOT NULL,
  platform    ENUM('android', 'ios', 'web') NOT NULL,
  last_seen   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_token (user_id, token),
  KEY idx_devices_user (user_id),
  CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- View to serve panel/report rows
DROP VIEW IF EXISTS v_panel_rows;
CREATE VIEW v_panel_rows AS
SELECT 
  et.id AS id,
  CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) AS paciente,
  DATE_FORMAT(et.exam_date, '%Y-%m-%d') AS fechaExamen,
  et.planta AS planta,
  et.sodio AS na,
  et.potasio AS k,
  et.cloro AS cl,
  et.alertas AS alertas,
  p.id AS patientId
FROM electrolyte_tests et
JOIN patients p ON p.id = et.patient_id;

-- Trigger: when a discharge is recorded, mark hospitalization as 'cerrada'
DELIMITER $$
DROP TRIGGER IF EXISTS trg_discharge_after_insert $$
CREATE TRIGGER trg_discharge_after_insert
AFTER INSERT ON discharges
FOR EACH ROW
BEGIN
  UPDATE hospitalizations
    SET estado = 'cerrada', updated_at = NOW()
    WHERE id = NEW.hospitalization_id;
END $$
DELIMITER ;

-- Seed user: admin (password: admin123 - CAMBIAR EN PRODUCCIÓN)
-- Password hash generado con: bcrypt.hash('admin123', 10)
INSERT INTO users (username, email, name, role, password_hash, is_active)
VALUES
  ('admin', 'admin@electromed.local', 'Administrador', 'medico', '$2b$10$rKZG3h5Qz5jF0YvS6f3r.uP3WjVZ5xK8J5KGYjZ5xK8J5KGYjZ5xK', 1)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Datos de ejemplo para testing (OPCIONAL - comentar si no se necesita)
INSERT INTO patients (identificacion, primer_nombre, primer_apellido, sexo, fecha_nacimiento, telefono, correo, departamento, ciudad, eps)
VALUES 
  ('1234567890', 'Juan', 'Pérez', 'Masculino', '1980-05-15', '3001234567', 'juan.perez@example.com', 'Antioquia', 'Medellín', 'EPS Sura'),
  ('9876543210', 'María', 'González', 'Femenino', '1992-08-20', '3109876543', 'maria.gonzalez@example.com', 'Valle del Cauca', 'Cali', 'Nueva EPS')
ON DUPLICATE KEY UPDATE identificacion=VALUES(identificacion);

-- Hospitalizaciones de ejemplo
INSERT INTO hospitalizations (patient_id, fecha_ingreso, planta, habitacion, diagnostico, motivo, estado)
VALUES 
  (1, CURDATE(), 'uci', 'UCI-01', 'Insuficiencia renal aguda', 'Ingreso por hiperkalemia', 'activa'),
  (2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'urgencias', 'URG-15', 'Hiponatremia severa', 'Paciente con vómitos persistentes', 'activa')
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id);

-- Exámenes de ejemplo
INSERT INTO electrolyte_tests (patient_id, hospitalization_id, exam_date, planta, sodio, potasio, cloro, alertas)
VALUES 
  (1, 1, CURDATE(), 'uci', 138.5, 5.8, 102.0, JSON_ARRAY('Hiperkalemia (K > 5.0)', 'Requiere monitoreo cada 4h')),
  (2, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'urgencias', 128.0, 3.8, 95.0, JSON_ARRAY('Hiponatremia severa (Na < 130)', 'Alerta crítica'))
ON DUPLICATE KEY UPDATE patient_id=VALUES(patient_id);

-- Verificación final
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_patients FROM patients;
SELECT COUNT(*) AS total_tests FROM electrolyte_tests;
