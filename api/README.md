# ElectroMed Backend API

Backend completo para **ElectroMed** (web + móvil) construido con:
- Node.js + TypeScript
- Express.js
- MySQL (con pool de conexiones)
- JWT para autenticación
- Nodemailer para envío de correos
- bcrypt para hashing de contraseñas

## 📁 Estructura

```
server/
├── src/
│   ├── config/           # Database, mailer
│   ├── controllers/      # Lógica de negocio
│   ├── middlewares/      # Auth, error handler
│   ├── routes/           # Definición de rutas
│   └── index.ts          # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Instalación

### 1. Instalar dependencias

Desde la carpeta `server/`:

```powershell
cd server
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y edita los valores:

```powershell
cp .env.example .env
```

Contenido mínimo del `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=electromed

JWT_SECRET=genera_un_secreto_aleatorio_256_bits
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASS=tu_contraseña
MAIL_FROM=ElectroMed <no-reply@electromed.local>
```

**Nota:** Para desarrollo local, puedes usar [Ethereal Email](https://ethereal.email/) para SMTP de prueba.

### 3. Crear la base de datos

Importa el schema MySQL desde la raíz del proyecto:

```powershell
mysql --user=root --password --host=127.0.0.1 --port=3306 < ../db/electromed_mysql.sql
```

Esto creará la base de datos `electromed` con todas las tablas, índices, trigger y un usuario admin de prueba.

### 4. Generar secreto JWT

Genera un secreto seguro:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado al campo `JWT_SECRET` en tu `.env`.

### 5. Cambiar password del admin

Genera un hash bcrypt para el usuario admin:

```powershell
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TuPassword123', 10, (err, hash) => console.log(hash));"
```

Actualiza la tabla `users`:

```sql
UPDATE users SET password_hash = '$2y$10$TU_HASH_AQUI' WHERE username = 'admin';
```

## 🏃 Ejecución

### Modo desarrollo (con hot-reload)

```powershell
npm run dev
```

El servidor arranca en `http://localhost:3000` (o el puerto configurado).

### Compilar para producción

```powershell
npm run build
npm start
```

## 📚 Endpoints API

### Autenticación

#### POST `/api/auth/login`
Login de usuario.

**Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/request-reset`
Solicitar código de recuperación de contraseña.

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "ok": true
}
```

Envía un código de 6 dígitos al correo (válido 10 min).

#### POST `/api/auth/confirm-reset`
Confirmar reset con código.

**Body:**
```json
{
  "email": "usuario@example.com",
  "code": "123456",
  "newPassword": "NuevaContraseña123"
}
```

**Response:**
```json
{
  "ok": true
}
```

---

### Pacientes

**Todas las rutas requieren header:**  
`Authorization: Bearer <token>`

#### POST `/api/patients`
Registrar nuevo paciente + crear hospitalización.

**Body:**
```json
{
  "identificacion": "1234567890",
  "primerNombre": "Juan",
  "segundoNombre": "Carlos",
  "primerApellido": "Pérez",
  "segundoApellido": "García",
  "sexo": "Masculino",
  "fechaNacimiento": "1985-05-15",
  "telefono": "3001234567",
  "correo": "juan.perez@example.com",
  "departamento": "Antioquia",
  "ciudad": "Medellín",
  "eps": "EPS Sura",
  "fechaIngreso": "2025-10-20",
  "area": "UCI",
  "habitacion": "101",
  "diagnostico": "Hipertensión arterial",
  "alergias": "Penicilina",
  "medicamentos": "Enalapril 10mg",
  "motivo": "Control de presión arterial elevada"
}
```

**Response:**
```json
{
  "ok": true,
  "id": "123",
  "hospitalizationId": 456
}
```

#### GET `/api/patients/:id`
Obtener paciente por ID con sus hospitalizaciones.

#### GET `/api/patients/identificacion/:identificacion`
Obtener paciente por número de documento.

---

### Panel (Electrolitos por planta)

#### GET `/api/panel?planta=uci&paciente=&fecha=&estado=`
Obtener datos del panel filtrados.

**Query params:**
- `planta` (requerido): `uci` | `urgencias` | `hospitalizacion`
- `paciente` (opcional): buscar por nombre o identificación
- `fecha` (opcional): fecha exacta `YYYY-MM-DD`
- `estado` (opcional): `activo` | `vencido`

**Response:**
```json
[
  {
    "id": 1,
    "paciente": "Juan Pérez",
    "fechaExamen": "2025-10-20",
    "planta": "uci",
    "na": 140,
    "k": 4.2,
    "cl": 101,
    "alertas": ["hiperkalemia"],
    "patientId": 123,
    "identificacion": "1234567890"
  }
]
```

---

### Reportes

#### GET `/api/reports/electrolytes?patient=&start=&end=&planta=`
Obtener reporte de electrolitos con filtros.

**Query params:**
- `patient` (opcional): nombre o identificación
- `start` (opcional): fecha inicio `YYYY-MM-DD`
- `end` (opcional): fecha fin `YYYY-MM-DD`
- `planta` (opcional): `uci` | `urgencias` | `hospitalizacion`

**Response:** Mismo formato que `/api/panel`.

---

### Dashboard

#### GET `/api/me`
Obtener datos del usuario autenticado.

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@electromed.local",
  "name": "Administrador",
  "role": "admin"
}
```

#### GET `/api/dashboard/metrics`
Métricas del dashboard.

**Response:**
```json
[
  { "label": "Pacientes Registrados", "value": 50 },
  { "label": "Hospitalizaciones Activas", "value": 12 },
  { "label": "Exámenes Hoy", "value": 8 },
  { "label": "Alertas Críticas", "value": 3 }
]
```

#### GET `/api/dashboard/recent-patients`
Pacientes recientes con nivel de alerta.

**Response:**
```json
[
  {
    "name": "Juan Pérez",
    "lastAnalysisAgo": "1 días",
    "level": "normal",
    "alertText": "Alertas: 2"
  }
]
```

---

### Altas (Discharges)

#### POST `/api/discharges`
Dar de alta a un paciente (cerrar hospitalización).

**Body:**
```json
{
  "hospitalizationId": 456,
  "fechaAlta": "2025-10-25",
  "motivo": "mejoria",
  "tipoEgreso": "Egreso por mejoría",
  "destino": "domicilio",
  "epicrisis": "Paciente evoluciona favorablemente...",
  "indicaciones": "Continuar con medicación...",
  "responsable": "Dr. Juan López",
  "reingresoRiesgo": "bajo",
  "observaciones": "Control en 15 días"
}
```

**Response:**
```json
{
  "ok": true,
  "id": 789
}
```

---

## 🔒 Seguridad

- Todas las contraseñas se hashean con bcrypt (10 rounds).
- JWT tokens firmados con secret seguro.
- Rate limiting en endpoints de autenticación (5 intentos cada 15 min).
- CORS configurable.
- Helmet para headers de seguridad HTTP.

## 🧪 Pruebas con Postman/Thunder Client

1. Login: `POST http://localhost:3000/api/auth/login`
2. Copiar el `token` de la respuesta
3. Para cualquier otra petición, agregar header:
   - `Authorization: Bearer <token>`

## 📦 Scripts disponibles

- `npm run dev` — Desarrollo con hot-reload
- `npm run build` — Compilar TypeScript
- `npm start` — Ejecutar versión compilada

## 🐛 Troubleshooting

### Error: Cannot find module 'express'
```powershell
npm install
```

### Error: MySQL connection failed
Verifica las credenciales en `.env` y que MySQL esté corriendo:
```powershell
mysql -u root -p -e "SELECT 1;"
```

### Error: SMTP not configured
Para desarrollo, usa Ethereal Email o comenta las líneas de envío de correo en `auth.controller.ts`.

### Error: Token inválido
Regenera el JWT_SECRET y vuelve a loguearte.

## 🚢 Deployment

Para producción:
1. Usa variables de entorno seguras (no `.env` en el repo).
2. Configura HTTPS/SSL.
3. Usa un servicio de SMTP real (SendGrid, AWS SES, etc.).
4. Habilita logs estructurados (Winston, Pino).
5. Configura rate limiting más estricto.
6. Usa un reverse proxy (nginx, Caddy).

## 📄 Licencia

MIT
