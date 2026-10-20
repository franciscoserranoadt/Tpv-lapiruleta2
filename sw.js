// Service Worker v5 con Forzado de Red (Network First) y Purga Inmediata de Caché Antigua
// Diseñado para La Piruleta TPV - Actualización automática en segundo plano para PC, Tablet y Móvil

const CACHE_NAME = 'lapiruleta-tpv-live-v5';

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

// 1. INSTALACIÓN: No espera a que las pestañas se cierren, se instala de inmediato
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. ACTIVACIÓN: Purga al instante todas las versiones anteriores de caché (v1, v2, v3, v4)
// y asume el control de todas las ventanas abiertas al segundo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purgando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ESTRATEGIA: NETWORK FIRST CON DIRECTIVA 'no-store' PARA OBTENER SIEMPRE LA VERSIÓN DE GITHUB
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Solo peticiones del mismo origen
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    // Pide siempre la versión en vivo de GitHub Pages sin usar memoria intermedia
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
        // En caso de corte de internet o modo offline en el mostrador, sirve la copia local
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
