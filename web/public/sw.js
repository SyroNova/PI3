// Service Worker para ElectroMed - Offline First
const CACHE_NAME = 'electromed-v2';
const RUNTIME_CACHE = 'electromed-runtime-v2';

// Recursos estáticos para cachear durante la instalación
// Importante: usar rutas relativas al scope del SW (carpeta public)
const STATIC_ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './ingresar.html',
  './consultar.html',
  './consultarPaciente.html',
  './panel.html',
  './config.html',
  './reportes.html',
  './styles/base.css',
  './styles/login.css',
  './styles/dashboard.css',
  './styles/ingresar.css',
  './styles/consultar.css',
  './styles/consultarPaciente.css',
  './styles/panel.css',
  './styles/config.css',
  './styles/reportes.css',
  './theme.js',
  './register-sw.js',
  './dist/app.js',
  './dist/app-dashboard.js',
  './dist/app-ingresar.js',
  './dist/app-panel.js',
  './dist/app-reportes.js',
  './assets/logo-electromed.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Network First con fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Para APIs: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Para recursos estáticos: Cache First
  event.respondWith(cacheFirstStrategy(request));
});

// Estrategia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Fetch falló, retornando respuesta offline:', error);
    // Retornar página offline personalizada si existe
  return caches.match('./index.html');
  }
}

// Estrategia Network First (para APIs)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network falló, buscando en cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar respuesta offline
    return new Response(
      JSON.stringify({ 
        offline: true, 
        message: 'No hay conexión a Internet' 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
}

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronización en background:', event.tag);
  
  if (event.tag === 'sync-patients') {
    event.waitUntil(syncPatients());
  }
});

// Función para sincronizar pacientes pendientes
async function syncPatients() {
  try {
    // Aquí implementarías la lógica para enviar datos pendientes al servidor
    console.log('[SW] Sincronizando pacientes pendientes...');
    
    // Notificar a los clientes que la sincronización se completó
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('[SW] Error en sincronización:', error);
  }
}
