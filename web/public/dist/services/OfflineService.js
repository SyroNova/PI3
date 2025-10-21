/**
 * OfflineService - Gestión de almacenamiento offline y sincronización
 */
export class OfflineService {
    constructor() {
        Object.defineProperty(this, "dbName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'electromed-offline-db'
        });
        Object.defineProperty(this, "dbVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Inicializar IndexedDB
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Store para pacientes
                if (!db.objectStoreNames.contains('patients')) {
                    const patientsStore = db.createObjectStore('patients', { keyPath: 'id' });
                    patientsStore.createIndex('identificacion', 'identificacion', { unique: true });
                    patientsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                // Store para operaciones pendientes
                if (!db.objectStoreNames.contains('pendingOperations')) {
                    const pendingStore = db.createObjectStore('pendingOperations', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                // Store para configuración
                if (!db.objectStoreNames.contains('config')) {
                    db.createObjectStore('config', { keyPath: 'key' });
                }
            };
        });
    }
    /**
     * Guardar paciente localmente
     */
    async savePatientLocally(patient) {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['patients'], 'readwrite');
            const store = transaction.objectStore('patients');
            const patientData = {
                ...patient,
                id: patient.id || this.generateId(),
                timestamp: Date.now(),
                synced: false
            };
            const request = store.put(patientData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Obtener todos los pacientes locales
     */
    async getAllPatientsLocally() {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['patients'], 'readonly');
            const store = transaction.objectStore('patients');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Buscar paciente por ID localmente
     */
    async getPatientByIdLocally(id) {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['patients'], 'readonly');
            const store = transaction.objectStore('patients');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Buscar paciente por identificación localmente
     */
    async getPatientByIdentificacionLocally(identificacion) {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['patients'], 'readonly');
            const store = transaction.objectStore('patients');
            const index = store.index('identificacion');
            const request = index.get(identificacion);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Agregar operación pendiente
     */
    async addPendingOperation(operation) {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
            const store = transaction.objectStore('pendingOperations');
            const operationData = {
                ...operation,
                timestamp: Date.now()
            };
            const request = store.add(operationData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Obtener operaciones pendientes
     */
    async getPendingOperations() {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingOperations'], 'readonly');
            const store = transaction.objectStore('pendingOperations');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Eliminar operación pendiente
     */
    async removePendingOperation(id) {
        if (!this.db)
            await this.initialize();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
            const store = transaction.objectStore('pendingOperations');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    /**
     * Sincronizar operaciones pendientes con el servidor
     */
    async syncPendingOperations() {
        const operations = await this.getPendingOperations();
        let success = 0;
        let failed = 0;
        for (const operation of operations) {
            try {
                const response = await fetch(operation.endpoint, {
                    method: operation.type === 'CREATE' ? 'POST' :
                        operation.type === 'UPDATE' ? 'PUT' : 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(operation.data)
                });
                if (response.ok) {
                    await this.removePendingOperation(operation.id);
                    // Marcar paciente como sincronizado si es una operación de creación
                    if (operation.type === 'CREATE' && operation.data.id) {
                        await this.markPatientAsSynced(operation.data.id);
                    }
                    success++;
                }
                else {
                    failed++;
                }
            }
            catch (error) {
                console.error('Error sincronizando operación:', error);
                failed++;
            }
        }
        return { success, failed };
    }
    /**
     * Marcar paciente como sincronizado
     */
    async markPatientAsSynced(patientId) {
        if (!this.db)
            await this.initialize();
        const patient = await this.getPatientByIdLocally(patientId);
        if (patient) {
            patient.synced = true;
            await this.savePatientLocally(patient);
        }
    }
    /**
     * Verificar si hay conexión a Internet
     */
    isOnline() {
        return navigator.onLine;
    }
    /**
     * Generar ID único
     */
    generateId() {
        return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Limpiar datos antiguos (opcional, mantener solo últimos 30 días)
     */
    async cleanOldData(daysToKeep = 30) {
        if (!this.db)
            await this.initialize();
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['patients'], 'readwrite');
            const store = transaction.objectStore('patients');
            const index = store.index('timestamp');
            const range = IDBKeyRange.upperBound(cutoffTime);
            const request = index.openCursor(range);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // Solo eliminar si está sincronizado
                    if (cursor.value.synced) {
                        cursor.delete();
                    }
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
}
// Instancia singleton
export const offlineService = new OfflineService();
