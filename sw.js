// Service Worker v3 con estrategia 'Network First' (Red Primero) para La Piruleta TPV
// Con esta configuración, siempre consulta GitHub para mostrar los últimos cambios al instante.
// Si no hay conexión a internet (modo offline en mostrador), sirve la copia guardada en caché.

const CACHE_NAME = 'lapiruleta-tpv-live-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './02-cobro-pagos.html',
  './03-tickets-mesas.html',
  './04-plano-mesas.html',
  './05-cierre-caja.html',
  './06-movimiento-caja.html',
  './07-historial-ventas.html',
  './08-detalle-reembolso.html',
  './09-clientes-fidelizacion.html',
  './10-catalogo-stock.html',
  './11-ajustes-impuestos.html',
  './12-modal-tipo-impuesto.html',
  './13-config-impresoras.html',
  './14-plantilla-ticket.html',
  './manifest.json'
];

// Instalación inmediata sin esperar
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activación inmediata y purga de versiones viejas de caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ESTRATEGIA: NETWORK FIRST (Red primero, caché de respaldo offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 1. Intenta pedir la versión más reciente a GitHub
    fetch(event.request)
      .then((networkResponse) => {
        // Si responde bien, actualiza en segundo plano la caché local
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 2. Si no hay internet o falla la red, lee de la caché local para seguir trabajando offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
