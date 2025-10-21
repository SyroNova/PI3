# Actualización del Backend - Push Notifications

## Archivos creados

### 1. Base de datos
**Ubicación:** `migrations/create_user_devices.sql`

Ejecuta esta migración en tu base de datos MySQL:
```bash
mysql -u root -p electromed < migrations/create_user_devices.sql
```

Esta crea la tabla `user_devices` para almacenar tokens FCM por usuario.

---

### 2. Servicio de FCM
**Ubicación:** `src/services/fcm.ts`

**Ya está creado**, no necesitas hacer nada más aquí.

**Configuración requerida en `.env`:**

Opción A (recomendada para dev): JSON directo
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"tu-proyecto",...}
```

Opción B: Archivo de credenciales
```env
GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\a\tu\service-account.json
```

Para obtener el JSON:
1. Ve a Firebase Console → Configuración del proyecto → Cuentas de servicio
2. Genera nueva clave privada (descarga JSON)
3. Copia el contenido completo y pégalo en `.env` como una sola línea o usa la ruta al archivo

---

### 3. Controlador de dispositivos
**Ubicación:** `src/controllers/device.controller.ts`

**Ya está creado**, implementa:
- `registerToken`: registra o actualiza el token FCM del usuario
- `testPush`: envía una notificación de prueba a los dispositivos del usuario

---

### 4. Rutas de dispositivos
**Ubicación:** `src/routes/device.routes.ts`

**Ya está creado**, define:
- `POST /api/devices/register-token`
- `POST /api/devices/test`

---

### 5. Integrar en `src/index.ts`

**ABRE** `src/index.ts` y realiza estos 3 cambios:

#### Cambio 1: Importar al inicio del archivo
Después de las otras importaciones de rutas, añade:
```typescript
import deviceRoutes from './routes/device.routes';
import { initializeFirebase } from './services/fcm';
```

#### Cambio 2: Inicializar Firebase
Después de `testDbConnection()` y antes de las rutas, añade:
```typescript
// Inicializar Firebase Admin
initializeFirebase();
```

#### Cambio 3: Registrar rutas de dispositivos
Después de las otras rutas (auth, patients, panel, etc.), añade:
```typescript
app.use('/api/devices', deviceRoutes);
```

**Ejemplo de cómo debería verse:**
```typescript
// ... importaciones existentes ...
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
// ... otras rutas ...
import deviceRoutes from './routes/device.routes';  // ← NUEVO
import { initializeFirebase } from './services/fcm';  // ← NUEVO

const app = express();

// ... middlewares existentes ...

// Probar conexión a BD
testDbConnection();

// Inicializar Firebase Admin  // ← NUEVO
initializeFirebase();           // ← NUEVO

// Rutas existentes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
// ... otras rutas ...
app.use('/api/devices', deviceRoutes);  // ← NUEVO

// ... resto del código ...
```

---

### 6. Instalar dependencia
```bash
cd c:\Users\aldamova\Desktop\backend_electromed
npm install firebase-admin
```

---

### 7. Compilar y ejecutar
```bash
npm run build
npm start
```

O en desarrollo:
```bash
npm run dev
```

---

## Pruebas

### 1. Registrar un token (se hace automático desde la app móvil)
```bash
curl -X POST http://localhost:3000/api/devices/register-token \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"fcm_token_aqui","platform":"android"}'
```

### 2. Enviar push de prueba
```bash
curl -X POST http://localhost:3000/api/devices/test \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Alerta crítica","body":"Paciente con K alto"}'
```

---

## Resumen de ubicaciones

```
backend_electromed/
├── migrations/
│   └── create_user_devices.sql          ← Ejecuta en MySQL
├── src/
│   ├── services/
│   │   └── fcm.ts                       ← Ya creado
│   ├── controllers/
│   │   └── device.controller.ts         ← Ya creado
│   ├── routes/
│   │   └── device.routes.ts             ← Ya creado
│   └── index.ts                         ← EDITA este (3 cambios)
└── .env                                 ← Añade FIREBASE_SERVICE_ACCOUNT_JSON
```
