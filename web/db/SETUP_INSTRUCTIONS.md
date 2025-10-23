# Configuración de la Base de Datos ElectroMed

Este directorio contiene el esquema SQL necesario para la base de datos de ElectroMed.

## Archivos

- **`setup_complete.sql`**: Script completo con todas las tablas, incluyendo `user_devices` para notificaciones push
- **`setup-database.ps1`**: Script de PowerShell para ejecutar el setup automáticamente
- **`electromed_mysql.sql`**: Schema original (ahora incluido en `setup_complete.sql`)

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

Ejecuta desde PowerShell en este directorio:

```powershell
.\setup-database.ps1
```

El script te guiará paso a paso y buscará MySQL en las ubicaciones comunes.

### Opción 2: Manual

Si tienes MySQL en el PATH:

```bash
mysql -u root -p < setup_complete.sql
```

O con la ruta completa:

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < setup_complete.sql
```

### Opción 3: MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. File → Open SQL Script → selecciona `setup_complete.sql`
4. Ejecuta el script (⚡ icono)

## 📋 Lo que se crea

### Base de datos: `electromed`

### Tablas:
- ✅ `users` - Usuarios del sistema (médicos, enfermería, auxiliares)
- ✅ `password_resets` - Tokens para recuperación de contraseña
- ✅ `patients` - Datos maestros de pacientes
- ✅ `hospitalizations` - Admisiones/Ingresos hospitalarios
- ✅ `discharges` - Altas médicas
- ✅ `electrolyte_tests` - Resultados de exámenes de electrolitos
- ✅ **`user_devices`** - Tokens FCM para notificaciones push (NUEVO)

### Vista:
- `v_panel_rows` - Join optimizado para el panel frontend

### Trigger:
- `trg_discharge_after_insert` - Cierra automáticamente la hospitalización al dar de alta

### Datos de prueba:
- Usuario admin: `admin` / `admin123` ⚠️ **CAMBIAR EN PRODUCCIÓN**
- 2 pacientes de ejemplo
- 2 hospitalizaciones activas
- 2 exámenes con alertas

## 🔧 Configuración del Backend

Después de ejecutar el script SQL, actualiza el `.env` del backend:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Deja vacío si root no tiene contraseña, o coloca la contraseña
DB_NAME=electromed

# Si root no tiene contraseña en desarrollo local, es normal dejarlo vacío
# En producción, SIEMPRE usa contraseña
```

## ✅ Verificación

Comprueba que todo se creó correctamente:

```sql
USE electromed;

-- Ver tablas
SHOW TABLES;

-- Verificar usuario admin
SELECT id, username, email, role FROM users;

-- Ver pacientes de ejemplo
SELECT identificacion, primer_nombre, primer_apellido FROM patients;

-- Ver tabla de dispositivos (para push notifications)
DESCRIBE user_devices;
```

## 🔥 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

**Causa**: El usuario root tiene contraseña y no la proporcionaste, o la contraseña es incorrecta.

**Solución**:
1. Si root no tiene contraseña en desarrollo, presiona Enter cuando se solicite
2. Si olvidaste la contraseña de root, busca cómo resetearla para tu versión de MySQL

### Error: "mysql: command not found"

**Causa**: MySQL no está en el PATH de Windows.

**Solución**: Usa la ruta completa o el script de PowerShell que busca MySQL automáticamente:
```powershell
.\setup-database.ps1
```

### Error: "Can't connect to MySQL server"

**Causa**: El servidor MySQL no está corriendo.

**Solución**:
- Abre "Servicios" de Windows (Win + R → `services.msc`)
- Busca "MySQL80" o similar
- Click derecho → Iniciar

### Error al ejecutar el script: "syntax error"

**Causa**: Problema con el delimitador o encoding.

**Solución**:
- Asegúrate de usar `--default-character-set=utf8mb4`
- O ejecuta el script desde MySQL Workbench

## 📱 Próximos Pasos

Después de configurar la base de datos:

1. ✅ **Actualiza el backend `.env`** con las credenciales correctas
2. 🔥 **Configura Firebase** para las notificaciones push (ver `PUSH_SETUP.md` en el backend)
3. 🚀 **Ejecuta el backend**: `npm start`
4. 📱 **Prueba la app móvil** conectándola al backend

## 🔐 Seguridad

⚠️ **IMPORTANTE para producción**:

1. Cambia la contraseña del usuario admin
2. Usa contraseñas fuertes para MySQL
3. No uses root en producción, crea un usuario específico:

```sql
CREATE USER 'electromed_app'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON electromed.* TO 'electromed_app'@'localhost';
FLUSH PRIVILEGES;
```

4. Actualiza el `.env` con el nuevo usuario
