# ElectroMed - Sistema de Gestión Hospitalaria

Plataforma completa para gestión de pacientes, electrolitos y reportes médicos.

## 📁 Estructura del Proyecto

```
electromed-landing-mvc-full/
├── public/               # Frontend web (HTML/CSS/JS)
├── src/                  # Frontend TypeScript (MVC)
├── server/               # Backend API (Node.js + Express + MySQL)
├── mobile_flutter/       # App móvil (Flutter) - próximamente
├── db/                   # Schema MySQL y seeds
└── README.md
```

## 🚀 Inicio Rápido

### 1. Backend (API)

```powershell
# Navegar al backend
cd server

# Instalar dependencias
npm install

# Configurar .env (ya está creado con valores de ejemplo)
# Editar server/.env con tus credenciales de MySQL

# Crear la base de datos
mysql --user=root --password < ../db/electromed_mysql.sql

# Opcional: Seed de datos de prueba
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor arranca en http://localhost:3000

**Usuarios de prueba después del seed:**
- Username: `admin` / Password: `admin123`
- Username: `dr.lopez` / Password: `medico123`

### 2. Frontend Web

```powershell
# Desde la raíz del proyecto
npm install
npm run dev
```

Abre http://localhost:5173

El frontend se conecta automáticamente al backend en puerto 3000 cuando está en desarrollo.

### 3. Base de Datos

MySQL 8.0+ requerido. El schema incluye:
- users, password_resets
- patients, hospitalizations, discharges
- electrolyte_tests
- Vista `v_panel_rows` y trigger para altas automáticas

Ver documentación completa en `db/README.md`

## 📱 App Móvil (Flutter) - En desarrollo

La app móvil se creará en la carpeta `mobile_flutter/` y consumirá la misma API REST del backend.

## 📚 Documentación

- **Backend API:** `server/README.md` - Endpoints, autenticación, instalación
- **Base de Datos:** `db/README.md` - Schema, mapeos, uso
- **Frontend Web:** Arquitectura MVC, offline-first con IndexedDB
- **Móvil Flutter:** (próximamente)

## 🔑 Características

### Web/Móvil
- ✅ Login con JWT
- ✅ Recuperación de contraseña (email con código 6 dígitos)
- ✅ Registro de pacientes + hospitalización
- ✅ Panel por planta (UCI, Urgencias, Hospitalización)
- ✅ Reportes con filtros y exportación
- ✅ Dashboard con métricas en tiempo real
- ✅ Dar de alta (discharge) con epicrisis
- 🔄 Soporte offline (web con IndexedDB)
- 📱 App móvil nativa (en desarrollo)

### Backend
- ✅ API REST completa con TypeScript
- ✅ MySQL con pool de conexiones
- ✅ JWT authentication
- ✅ Envío de emails (Nodemailer)
- ✅ Rate limiting
- ✅ Bcrypt para passwords
- ✅ Validaciones con Joi
- ✅ CORS y Helmet

## 🛠️ Stack Tecnológico

### Frontend Web
- TypeScript
- HTML5 + CSS3
- MVC architecture
- IndexedDB (offline)
- Service Workers

### Backend
- Node.js + TypeScript
- Express.js
- MySQL 8.0
- JWT + bcrypt
- Nodemailer

### Móvil
- Flutter (Dart)
- Provider/Riverpod (state management)
- HTTP client
- SQLite (offline)

## 🔐 Seguridad

- Passwords hasheados con bcrypt (10 rounds)
- JWT tokens con expiración configurable
- Rate limiting en endpoints sensibles
- SQL injection prevention (prepared statements)
- XSS protection (Helmet)
- CORS configurable

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/request-reset` - Solicitar código
- `POST /api/auth/confirm-reset` - Confirmar reset

### Patients
- `POST /api/patients` - Crear paciente + hospitalización
- `GET /api/patients/:id` - Obtener por ID
- `GET /api/patients/identificacion/:doc` - Obtener por documento

### Panel & Reportes
- `GET /api/panel` - Datos por planta con filtros
- `GET /api/reports/electrolytes` - Reporte de electrolitos

### Dashboard
- `GET /api/me` - Usuario actual
- `GET /api/dashboard/metrics` - Métricas
- `GET /api/dashboard/recent-patients` - Pacientes recientes

### Discharges
- `POST /api/discharges` - Dar de alta

Ver documentación completa de endpoints en `server/README.md`

## 🧪 Testing

```powershell
# Backend
cd server
npm run dev

# Probar con Postman/Thunder Client:
# 1. POST http://localhost:3000/api/auth/login
#    Body: {"username": "admin", "password": "admin123"}
# 2. Copiar el token
# 3. Agregar header en otras peticiones:
#    Authorization: Bearer <token>
```

## 🚢 Deployment

### Backend
1. Configurar variables de entorno en producción
2. Usar HTTPS/SSL
3. Configurar SMTP real (SendGrid, AWS SES)
4. Reverse proxy (nginx)
5. PM2 para process management

### Frontend Web
- Deploy estático en Netlify, Vercel, GitHub Pages
- Configurar `apiBaseUrl` en producción

### Base de Datos
- MySQL en servidor dedicado o servicio cloud
- Backups automáticos
- Réplicas para alta disponibilidad

## 📝 TODO

- [ ] Tests unitarios e integración (Jest/Supertest)
- [ ] Docker Compose para desarrollo
- [ ] CI/CD pipeline
- [ ] Logs estructurados (Winston)
- [ ] Métricas (Prometheus)
- [ ] WebSockets para notificaciones en tiempo real
- [ ] App móvil Flutter completa
- [ ] PWA improvements

## 📄 Licencia

MIT

## 👨‍💻 Desarrollo

Para mover el backend a otro proyecto:
1. Copia la carpeta `server/` completa
2. Copia `db/` para el schema
3. `npm install` en la nueva ubicación
4. Configura `.env` con las nuevas credenciales

Para la app móvil:
1. Copia `mobile_flutter/` cuando esté completa
2. `flutter pub get`
3. Configura la URL del backend en las constantes de la app

---

**Desarrollado para ElectroMed © 2025**
