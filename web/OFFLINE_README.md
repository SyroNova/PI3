# 📵 Funcionalidad Offline-First - ElectroMed

## 🎯 Resumen

ElectroMed ahora cuenta con **funcionalidad offline-first completa**, permitiendo que la aplicación web funcione sin conexión a Internet y sincronice automáticamente los datos cuando vuelva la conectividad.

---

## ✨ Características Principales

### 1. **Trabajo Sin Conexión**
- ✅ Registro de pacientes offline
- ✅ Consulta de pacientes guardados localmente
- ✅ Almacenamiento automático en IndexedDB
- ✅ Cola de operaciones pendientes

### 2. **Sincronización Automática**
- ✅ Detección automática de conexión
- ✅ Sincronización en background cuando vuelve Internet
- ✅ Notificaciones de estado de sincronización
- ✅ Resolución de conflictos

### 3. **Indicadores Visuales**
- ✅ Notificación cuando se pierde la conexión
- ✅ Notificación cuando se recupera la conexión
- ✅ Badge "Guardado offline" en registros locales
- ✅ Indicador persistente en la barra superior

### 4. **PWA (Progressive Web App)**
- ✅ Instalable como app nativa
- ✅ Funciona sin conexión
- ✅ Actualizaciones automáticas
- ✅ Notificaciones push (futuro)

---

## 🚀 Cómo Usar

### Para Usuarios:

1. **Modo Normal (Online)**:
   - La aplicación funciona normalmente
   - Los datos se guardan en el servidor inmediatamente
   - Sin indicadores especiales

2. **Modo Offline**:
   - Si pierdes conexión, verás una notificación: **"📵 Modo sin conexión"**
   - Puedes seguir registrando pacientes normalmente
   - Los datos se guardan localmente en tu dispositivo
   - Verás un badge **"📵 Guardado offline"** en las confirmaciones

3. **Cuando Vuelve la Conexión**:
   - Verás una notificación: **"🌐 Conexión restaurada"**
   - Los datos se sincronizan automáticamente
   - Recibirás confirmación: **"✅ Datos sincronizados"**

### Para Desarrolladores:

#### Inicializar el Modo Offline

```typescript
import { offlineService } from './services/OfflineService';
import { networkMonitor } from './services/NetworkMonitor';

// Inicializar en tu controlador
await offlineService.initialize();

// Suscribirse a cambios de conexión
networkMonitor.subscribe((isOnline) => {
  if (isOnline) {
    console.log('Conexión restaurada');
    syncPendingData();
  } else {
    console.log('Sin conexión');
  }
});
```

#### Guardar Datos Offline

```typescript
// Verificar estado de conexión
if (!networkMonitor.getStatus()) {
  // Guardar localmente
  await offlineService.savePatientLocally(patientData);
  
  // Agregar a cola de pendientes
  await offlineService.addPendingOperation({
    type: 'CREATE',
    endpoint: '/api/patients',
    data: patientData
  });
}
```

#### Sincronizar Datos

```typescript
// La sincronización es automática, pero puedes forzarla:
const result = await offlineService.syncPendingOperations();
console.log(`${result.success} sincronizadas, ${result.failed} fallidas`);
```

---

## 🏗️ Arquitectura Técnica

### Service Worker (`public/sw.js`)
- Intercepta requests de red
- Cachea recursos estáticos (HTML, CSS, JS, imágenes)
- Implementa estrategias de cache:
  - **Cache First**: Para recursos estáticos
  - **Network First**: Para APIs

### IndexedDB (`OfflineService.ts`)
Base de datos local con 3 stores:

```typescript
{
  patients: {           // Pacientes registrados
    id: string,
    identificacion: string,
    // ... campos del paciente
    synced: boolean,    // false si pendiente de sincronizar
    timestamp: number
  },
  
  pendingOperations: {  // Cola de operaciones
    id: string,
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    data: any,
    timestamp: number
  },
  
  config: {            // Configuración de la app
    key: string,
    value: any
  }
}
```

### Network Monitor (`NetworkMonitor.ts`)
- Detecta cambios en la conectividad
- Notifica a componentes suscritos
- Actualiza UI automáticamente
- Dispara sincronización cuando vuelve conexión

---

## 📱 Instalar como PWA

### En Chrome/Edge Desktop:
1. Abre la aplicación en el navegador
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Click en "Instalar ElectroMed"
4. La app se abrirá como ventana independiente

### En Chrome Mobile:
1. Abre la aplicación en Chrome
2. Toca el menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio

### En Safari iOS:
1. Abre la aplicación en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a inicio"
4. Confirma

---

## 🧪 Probar la Funcionalidad Offline

### Método 1: DevTools (Chrome)
1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. En el menú izquierdo, selecciona "Service Workers"
4. Activa el checkbox "Offline"
5. Intenta registrar un paciente
6. Verifica en "Storage" → "IndexedDB" → "electromed-offline-db"
7. Desactiva "Offline" y observa la sincronización

### Método 2: Modo Avión (Móvil/PC)
1. Activa el modo avión en tu dispositivo
2. Registra un paciente
3. Verifica el mensaje "Guardado offline"
4. Desactiva el modo avión
5. Observa la sincronización automática

### Método 3: Desconectar WiFi
1. Desconecta tu WiFi/Ethernet
2. La app mostrará "📵 Modo sin conexión"
3. Registra datos normalmente
4. Reconecta el WiFi
5. Verás "✅ Datos sincronizados"

---

## 🔍 Debugging

### Ver el Service Worker
```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations);
});
```

### Ver datos en IndexedDB
```javascript
// En DevTools → Application → IndexedDB → electromed-offline-db

// O programáticamente:
const request = indexedDB.open('electromed-offline-db');
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('patients', 'readonly');
  const store = tx.objectStore('patients');
  const getAllRequest = store.getAll();
  
  getAllRequest.onsuccess = () => {
    console.log('Pacientes locales:', getAllRequest.result);
  };
};
```

### Ver operaciones pendientes
```javascript
import { offlineService } from './services/OfflineService';

const pending = await offlineService.getPendingOperations();
console.log('Operaciones pendientes:', pending);
```

---

## 🐛 Solución de Problemas

### El Service Worker no se registra
- Verificar que estés usando HTTPS o localhost
- Verificar que el archivo `sw.js` esté en `/public/`
- Limpiar cache y registros antiguos:
  ```javascript
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
  ```

### Los datos no se sincronizan
- Verificar que haya conexión a Internet
- Verificar el token de autenticación en localStorage
- Revisar la cola de pendientes en IndexedDB
- Verificar logs en la consola

### La app no funciona offline
- Verificar que el Service Worker esté activo
- Verificar que los recursos estén cacheados
- Forzar actualización del Service Worker

### Limpiar todos los datos locales
```javascript
// Limpiar Service Workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Limpiar IndexedDB
indexedDB.deleteDatabase('electromed-offline-db');

// Limpiar Cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Recargar página
location.reload();
```

---

## 📊 Métricas y Monitoreo

### Ver estadísticas de uso
```javascript
import { offlineService } from './services/OfflineService';

// Total de pacientes locales
const patients = await offlineService.getAllPatientsLocally();
console.log(`Total pacientes locales: ${patients.length}`);

// Pacientes no sincronizados
const notSynced = patients.filter(p => !p.synced);
console.log(`Pendientes de sincronizar: ${notSynced.length}`);

// Operaciones pendientes
const pending = await offlineService.getPendingOperations();
console.log(`Operaciones en cola: ${pending.length}`);
```

---

## 🔐 Seguridad y Privacidad

### Datos Almacenados Localmente
- Los datos se almacenan en IndexedDB del navegador
- Solo accesibles desde el mismo origen (dominio)
- Se limpian al cerrar sesión o limpiar datos del navegador
- Opcional: Encriptación de datos sensibles (próxima versión)

### Sincronización Segura
- Todas las requests usan el token JWT del usuario
- Las operaciones se validan en el servidor
- No se sobrescriben datos del servidor sin verificación

---

## 🚧 Próximas Mejoras

- [ ] Encriptación de datos locales
- [ ] Resolución avanzada de conflictos
- [ ] Notificaciones push
- [ ] Sincronización selectiva por tipo de datos
- [ ] Compresión de datos almacenados
- [ ] Límite de tiempo de retención de datos
- [ ] Estadísticas de uso offline
- [ ] Modo offline forzado (para pruebas)

---

## 📞 Soporte

Si encuentras algún problema con la funcionalidad offline:
1. Revisa la sección "Solución de Problemas" arriba
2. Verifica los logs en la consola del navegador
3. Reporta el issue con capturas de pantalla

---

## 📚 Recursos Adicionales

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox (Google)](https://developers.google.com/web/tools/workbox)
