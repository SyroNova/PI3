/**
 * NetworkMonitor - Monitoreo del estado de conexión
 */
export class NetworkMonitor {
    constructor() {
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "isOnline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: navigator.onLine
        });
        this.initialize();
    }
    /**
     * Inicializar listeners de eventos
     */
    initialize() {
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    }
    /**
     * Manejar cambios de conexión
     */
    handleConnectionChange(online) {
        this.isOnline = online;
        this.notifyCallbacks(online);
        this.updateUI(online);
    }
    /**
     * Notificar a todos los callbacks registrados
     */
    notifyCallbacks(online) {
        this.callbacks.forEach(callback => callback(online));
    }
    /**
     * Actualizar UI con indicador de estado
     */
    updateUI(online) {
        this.showConnectionNotification(online);
    }
    /**
     * Mostrar notificación de estado de conexión
     */
    showConnectionNotification(online) {
        // Remover notificación existente si hay
        const existingNotification = document.getElementById('connection-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.id = 'connection-notification';
        notification.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
        if (online) {
            notification.style.background = '#10b981';
            notification.style.color = '#fff';
            notification.innerHTML = '🌐 Conexión restaurada';
            // Auto-ocultar después de 3 segundos
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
        else {
            notification.style.background = '#f59e0b';
            notification.style.color = '#fff';
            notification.innerHTML = '📵 Modo sin conexión';
        }
        document.body.appendChild(notification);
        // Agregar estilos de animación si no existen
        if (!document.getElementById('connection-animations')) {
            const style = document.createElement('style');
            style.id = 'connection-animations';
            style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
            document.head.appendChild(style);
        }
    }
    /**
     * Suscribirse a cambios de conexión
     */
    subscribe(callback) {
        this.callbacks.add(callback);
        // Retornar función para desuscribirse
        return () => {
            this.callbacks.delete(callback);
        };
    }
    /**
     * Obtener estado actual de conexión
     */
    getStatus() {
        return this.isOnline;
    }
    /**
     * Agregar indicador permanente de estado offline en la barra superior
     */
    addPersistentIndicator() {
        if (!this.isOnline) {
            const topbar = document.querySelector('.app-topbar');
            if (topbar && !document.getElementById('offline-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'offline-indicator';
                indicator.style.cssText = `
          background: #f59e0b;
          color: #fff;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        `;
                indicator.innerHTML = '📵 Offline';
                topbar.appendChild(indicator);
            }
        }
        else {
            const indicator = document.getElementById('offline-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
}
// Instancia singleton
export const networkMonitor = new NetworkMonitor();
