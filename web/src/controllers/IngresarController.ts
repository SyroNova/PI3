import type { Patient } from '../models/Patient.js';
import { IngresarService } from '../services/IngresarService.js';
import { networkMonitor } from '../services/NetworkMonitor.js';
import { offlineService } from '../services/OfflineService.js';
import { IngresarView } from '../views/IngresarView.js';

export class IngresarController {
  private view: IngresarView;
  private service: IngresarService;

  constructor() {
    this.view = new IngresarView();
    this.service = new IngresarService();
    this.view.onSubmit((data) => this.handleSubmit(data));
    this.initializeOffline();
  }

  private async initializeOffline(): Promise<void> {
    try {
      await offlineService.initialize();
      
      // Suscribirse a cambios de conexión
      networkMonitor.subscribe((isOnline) => {
        if (isOnline) {
          this.syncPendingData();
        }
      });

      // Agregar indicador persistente si está offline
      networkMonitor.addPersistentIndicator();
    } catch (error) {
      console.error('Error inicializando modo offline:', error);
    }
  }

  private async handleSubmit(data: Patient): Promise<void> {
    this.view.setSubmitting(true);
    
    const isOnline = networkMonitor.getStatus();
    
    if (!isOnline) {
      // Guardar localmente si no hay conexión
      await this.saveOffline(data);
      this.view.setSubmitting(false);
      return;
    }

    // Intentar guardar en el servidor
    const res = await this.service.register(data);
    this.view.setSubmitting(false);
    
    if (!res.ok) {
      // Si falla, guardar localmente
      await this.saveOffline(data);
      this.view.showError(res.error ?? 'No fue posible registrar el paciente. Guardado localmente.');
      return;
    }
    
    this.view.showSuccess(res.id ?? '');
  }

  private async saveOffline(data: Patient): Promise<void> {
    try {
      const patientWithId = {
        ...data,
        id: offlineService.generateId()
      };

      // Guardar paciente localmente
      await offlineService.savePatientLocally(patientWithId);

      // Agregar operación pendiente
      await offlineService.addPendingOperation({
        type: 'CREATE',
        endpoint: '/api/patients',
        data: patientWithId
      });

      this.view.showSuccess(patientWithId.id, true);
      
      console.log('📦 Paciente guardado offline, se sincronizará cuando vuelva la conexión');
    } catch (error) {
      console.error('Error guardando offline:', error);
      this.view.showError('Error guardando los datos localmente');
    }
  }

  private async syncPendingData(): Promise<void> {
    try {
      const result = await offlineService.syncPendingOperations();
      if (result.success > 0) {
        console.log(`✅ ${result.success} operaciones sincronizadas`);
      }
      if (result.failed > 0) {
        console.log(`⚠️ ${result.failed} operaciones fallaron`);
      }
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  }
}
