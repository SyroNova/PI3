# 📱 Guía de Implementación Offline-First

## 🌐 Web - Implementación Completada

### ✅ Características Implementadas

1. **Service Worker (`public/sw.js`)**
   - Cacheo de recursos estáticos (HTML, CSS, JS, imágenes)
   - Estrategia Cache-First para recursos estáticos
   - Estrategia Network-First para APIs
   - Sincronización en background cuando vuelve la conexión
   
2. **IndexedDB (`src/services/OfflineService.ts`)**
   - Almacenamiento local de pacientes
   - Cola de operaciones pendientes (CREATE, UPDATE, DELETE)
   - Sincronización automática cuando vuelve la conexión
   - Búsqueda local por ID o identificación
   
3. **Monitor de Conexión (`src/services/NetworkMonitor.ts`)**
   - Detección automática de cambios en la conectividad
   - Notificaciones visuales cuando se pierde/recupera conexión
   - Indicador persistente en modo offline
   
4. **Integración en Controladores**
   - `IngresarController`: Guarda pacientes offline y sincroniza automáticamente
   - Indicadores visuales de estado offline en formularios

### 🚀 Cómo Funciona

#### Registro de Paciente Offline:
```typescript
// 1. Usuario completa formulario
// 2. Sistema detecta que no hay conexión
// 3. Datos se guardan en IndexedDB
// 4. Operación se agrega a la cola de pendientes
// 5. Usuario ve confirmación "Guardado offline"
// 6. Cuando vuelve conexión, se sincroniza automáticamente
```

#### Flujo de Sincronización:
```
Sin Conexión → Guardar Local → Cola de Pendientes
                                       ↓
Conexión Restaurada → Sincronizar Automáticamente → Actualizar UI
```

### 📦 Almacenamiento Local

**Stores de IndexedDB:**
- `patients`: Todos los pacientes registrados
- `pendingOperations`: Operaciones que esperan sincronización
- `config`: Configuración de la aplicación

**Estructura de Datos:**
```typescript
{
  id: "local-1729012345-abc123",
  identificacion: "123456789",
  primerNombre: "Juan",
  // ... otros datos del paciente
  timestamp: 1729012345678,
  synced: false  // true cuando se sincroniza con servidor
}
```

---

## 📱 Móvil - Guía de Implementación

### Para React Native / Flutter / Ionic

#### 1. Almacenamiento Local

**React Native:**
```javascript
// Usar AsyncStorage o SQLite
import AsyncStorage from '@react-native-async-storage/async-storage';

// O mejor aún, usar Realm o WatermelonDB
import Realm from 'realm';

const PatientSchema = {
  name: 'Patient',
  properties: {
    id: 'string',
    identificacion: 'string',
    primerNombre: 'string',
    // ...
    synced: 'bool',
    timestamp: 'date'
  },
  primaryKey: 'id'
};
```

**Flutter:**
```dart
// Usar Hive o Drift (SQLite)
import 'package:hive/hive.dart';

@HiveType(typeId: 0)
class Patient extends HiveObject {
  @HiveField(0)
  late String id;
  
  @HiveField(1)
  late String identificacion;
  
  @HiveField(2)
  late bool synced;
  
  // ...
}
```

#### 2. Detección de Conectividad

**React Native:**
```javascript
import NetInfo from '@react-native-community/netinfo';

const unsubscribe = NetInfo.addEventListener(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
  
  if (state.isConnected) {
    syncPendingOperations();
  }
});
```

**Flutter:**
```dart
import 'package:connectivity_plus/connectivity_plus.dart';

final subscription = Connectivity()
  .onConnectivityChanged
  .listen((ConnectivityResult result) {
    if (result != ConnectivityResult.none) {
      syncPendingOperations();
    }
  });
```

#### 3. Sincronización en Background

**React Native:**
```javascript
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15, // minutos
  stopOnTerminate: false,
  startOnBoot: true
}, async (taskId) => {
  console.log('[BackgroundFetch] taskId:', taskId);
  await syncPendingOperations();
  BackgroundFetch.finish(taskId);
});
```

**Flutter:**
```dart
import 'package:workmanager/workmanager.dart';

Workmanager().initialize(callbackDispatcher);
Workmanager().registerPeriodicTask(
  "sync-task",
  "syncPendingOperations",
  frequency: Duration(minutes: 15),
);
```

#### 4. Arquitectura Recomendada

```
┌─────────────────────────────────────┐
│         UI Layer (Views)            │
│  - Pantallas de registro            │
│  - Indicadores de estado offline    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Business Logic (Controllers)   │
│  - Validación de datos              │
│  - Decisión: online vs offline      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Data Layer (Services)          │
│  ┌─────────────┬─────────────────┐  │
│  │   API       │   Local DB      │  │
│  │  Service    │   Service       │  │
│  └─────────────┴─────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Sync Service                │  │
│  │   - Cola de operaciones       │  │
│  │   - Sincronización auto       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### 5. Ejemplo de Implementación Completa

**Servicio de Offline (React Native):**
```javascript
// services/OfflineService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineService {
  constructor() {
    this.PENDING_KEY = '@pending_operations';
    this.PATIENTS_KEY = '@patients';
    this.initNetListener();
  }

  initNetListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.syncPendingOperations();
      }
    });
  }

  async savePatientLocally(patient) {
    try {
      const patients = await this.getAllPatientsLocally();
      const patientWithId = {
        ...patient,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        synced: false
      };
      
      patients.push(patientWithId);
      await AsyncStorage.setItem(this.PATIENTS_KEY, JSON.stringify(patients));
      
      // Agregar a cola de pendientes
      await this.addPendingOperation({
        type: 'CREATE',
        endpoint: '/api/patients',
        data: patientWithId
      });
      
      return patientWithId;
    } catch (error) {
      console.error('Error saving locally:', error);
      throw error;
    }
  }

  async getAllPatientsLocally() {
    try {
      const data = await AsyncStorage.getItem(this.PATIENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading locally:', error);
      return [];
    }
  }

  async addPendingOperation(operation) {
    try {
      const pending = await this.getPendingOperations();
      pending.push({
        ...operation,
        id: Date.now().toString(),
        timestamp: Date.now()
      });
      await AsyncStorage.setItem(this.PENDING_KEY, JSON.stringify(pending));
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  }

  async getPendingOperations() {
    try {
      const data = await AsyncStorage.getItem(this.PENDING_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading pending:', error);
      return [];
    }
  }

  async syncPendingOperations() {
    const pending = await this.getPendingOperations();
    const remaining = [];
    
    for (const operation of pending) {
      try {
        const response = await fetch(operation.endpoint, {
          method: operation.type === 'CREATE' ? 'POST' : 
                  operation.type === 'UPDATE' ? 'PUT' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`
          },
          body: JSON.stringify(operation.data)
        });

        if (!response.ok) {
          remaining.push(operation);
        } else {
          // Marcar como sincronizado
          await this.markPatientAsSynced(operation.data.id);
        }
      } catch (error) {
        console.error('Error syncing:', error);
        remaining.push(operation);
      }
    }

    await AsyncStorage.setItem(this.PENDING_KEY, JSON.stringify(remaining));
    return {
      success: pending.length - remaining.length,
      failed: remaining.length
    };
  }

  async markPatientAsSynced(patientId) {
    const patients = await this.getAllPatientsLocally();
    const updated = patients.map(p => 
      p.id === patientId ? { ...p, synced: true } : p
    );
    await AsyncStorage.setItem(this.PATIENTS_KEY, JSON.stringify(updated));
  }
}

export const offlineService = new OfflineService();
```

**Uso en un Componente:**
```javascript
// screens/IngresarPaciente.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { offlineService } from '../services/OfflineService';

export default function IngresarPaciente() {
  const [isOnline, setIsOnline] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!isOnline) {
      // Guardar offline
      const patient = await offlineService.savePatientLocally(formData);
      Alert.alert(
        '📵 Guardado Offline',
        `Paciente registrado localmente. ID: ${patient.id}\nSe sincronizará cuando vuelva la conexión.`
      );
    } else {
      // Enviar al servidor
      try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          Alert.alert('✅ Éxito', 'Paciente registrado correctamente');
        } else {
          throw new Error('Error en servidor');
        }
      } catch (error) {
        // Si falla, guardar offline
        const patient = await offlineService.savePatientLocally(formData);
        Alert.alert(
          '⚠️ Error de Conexión',
          `Guardado offline. ID: ${patient.id}`
        );
      }
    }
  };

  return (
    <View>
      {!isOnline && (
        <View style={{ backgroundColor: '#f59e0b', padding: 10 }}>
          <Text style={{ color: 'white' }}>📵 Modo Sin Conexión</Text>
        </View>
      )}
      
      <TextInput
        placeholder="Identificación"
        value={formData.identificacion}
        onChangeText={(text) => setFormData({...formData, identificacion: text})}
      />
      
      {/* Más campos... */}
      
      <Button title="Registrar Paciente" onPress={handleSubmit} />
    </View>
  );
}
```

---

## 🧪 Pruebas de Funcionalidad Offline

### Web:
1. Abrir DevTools → Application → Service Workers
2. Activar "Offline" checkbox
3. Intentar registrar un paciente
4. Verificar que se guarda en IndexedDB
5. Desactivar "Offline"
6. Verificar que se sincroniza automáticamente

### Móvil:
1. Activar modo avión en el dispositivo
2. Registrar un paciente
3. Verificar que se guarda localmente
4. Desactivar modo avión
5. Verificar que se sincroniza con el servidor

---

## 📚 Librerías Recomendadas

### React Native:
- `@react-native-async-storage/async-storage` - Almacenamiento simple
- `@react-native-community/netinfo` - Detección de conexión
- `react-native-background-fetch` - Tareas en background
- `realm` o `watermelondb` - Base de datos local avanzada

### Flutter:
- `hive` o `drift` - Base de datos local
- `connectivity_plus` - Detección de conexión
- `workmanager` - Tareas en background

### Ionic/Capacitor:
- `@capacitor/storage` - Almacenamiento
- `@capacitor/network` - Estado de red
- `@capacitor/background-runner` - Tareas en background

---

## 🎯 Checklist de Implementación

### Web ✅
- [x] Service Worker configurado
- [x] IndexedDB implementado
- [x] Monitor de conexión
- [x] Sincronización automática
- [x] Indicadores visuales
- [x] Cola de operaciones pendientes

### Móvil 📋
- [ ] Configurar almacenamiento local
- [ ] Implementar detección de conectividad
- [ ] Crear servicio de sincronización
- [ ] Agregar tareas en background
- [ ] Implementar UI indicators
- [ ] Probar en dispositivos reales

---

## 🔒 Consideraciones de Seguridad

1. **Encriptación de Datos Locales**
   - Encriptar datos sensibles antes de guardar
   - Usar bibliotecas como `react-native-keychain`

2. **Expiración de Tokens**
   - Verificar validez de tokens antes de sincronizar
   - Implementar refresh de tokens automático

3. **Límite de Almacenamiento**
   - Limpiar datos antiguos periódicamente
   - Implementar límites de tamaño

4. **Conflictos de Sincronización**
   - Implementar estrategia de resolución de conflictos
   - Usar timestamps para determinar versión más reciente

---

## 📞 Soporte

Para más información sobre la implementación offline-first, consultar:
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Flutter Hive](https://docs.hivedb.dev/)
