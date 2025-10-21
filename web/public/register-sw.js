/**
 * Registro del Service Worker
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration.scope);

        // Verificar actualizaciones periódicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Cada minuto

        // Manejar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error);
      });

    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        console.log('✅ Sincronización completada');
        showSyncNotification();
      }
    });
  });

  // Solicitar sincronización cuando vuelva la conexión
  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('sync-patients');
      }).catch((error) => {
        console.error('Error al solicitar sincronización:', error);
      });
    }
  });
}

/**
 * Mostrar notificación de actualización disponible
 */
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 1rem;
  `;

  notification.innerHTML = `
    <span>🔄 Nueva versión disponible</span>
    <button id="reload-btn" style="
      background: white;
      color: #2563eb;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    ">Actualizar</button>
  `;

  document.body.appendChild(notification);

  document.getElementById('reload-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

/**
 * Mostrar notificación de sincronización exitosa
 */
function showSyncNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;

  notification.innerHTML = '✅ Datos sincronizados';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
