// Service Worker para ElectroMed - Offline First
const CACHE_NAME = 'electromed-v3';
const RUNTIME_CACHE = 'electromed-runtime-v3';

// Recursos estáticos (rutas absolutas desde /public)
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

// Interceptar fetch (Network First para APIs, Cache First para recursos)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones externas
  if (url.origin !== location.origin) return;

  // Para APIs → Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Para páginas HTML → permitir redirecciones explícitamente
  if (request.destination === 'document') {
    event.respondWith(htmlStrategy(request));
    return;
  }

  // Para otros recursos estáticos → Cache First
  event.respondWith(cacheFirstStrategy(request));
});

// Estrategia Cache First (CSS, JS, imágenes, etc.)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request, { redirect: 'follow' });

    // Evitar problemas con respuestas redireccionadas
    if (networkResponse.type === 'opaqueredirect') {
      return Response.redirect(networkResponse.url, 302);
    }

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache First: fetch falló →', error);
    return caches.match('/index.html');
  }
}

// Estrategia Network First (APIs)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request, { redirect: 'follow' });

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network First: offline →', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    return new Response(
      JSON.stringify({ offline: true, message: 'No hay conexión a Internet' }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

// Estrategia especial para documentos HTML
async function htmlStrategy(request) {
  try {
    const networkResponse = await fetch(request, { redirect: 'follow' });
    if (networkResponse.type === 'opaqueredirect') {
      return Response.redirect(networkResponse.url, 302);
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] HTML Strategy: offline, mostrando index.html');
    return caches.match('/index.html');
  }
}

// Sincronización en background (opcional)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronización en background:', event.tag);

  if (event.tag === 'sync-patients') {
    event.waitUntil(syncPatients());
  }
});

async function syncPatients() {
  try {
    console.log('[SW] Sincronizando pacientes pendientes...');
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETE', data: { success: true } });
    });
  } catch (error) {
    console.error('[SW] Error en sincronización:', error);
  }
}
