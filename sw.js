// Service Worker v4 con Estrategia Network-First Agresiva y Purga Inmediata de Caché
// Diseñado para La Piruleta TPV (Actualización automática instantánea en PC, Tablets y Móvil)

const CACHE_NAME = 'lapiruleta-tpv-live-v4';

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

// 1. INSTALACIÓN: Obliga al nuevo Service Worker a activarse de inmediato sin esperar
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. ACTIVACIÓN: Borra inmediatamente todas las versiones viejas de caché (v1, v2, v3, etc.)
// y toma control de todas las ventanas abiertas al instante.
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

// 3. ESTRATEGIA: NETWORK FIRST CON TIMESTAMP DE EVASIÓN DE CACHÉ PARA DOCUMENTOS HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Solo gestionamos peticiones del mismo origen
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    // Intenta siempre pedir la versión en vivo de GitHub Pages
    fetch(event.request, { cache: 'no-store' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Modo offline (si falla la conexión o estamos sin internet)
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
