// Service Worker para soporte offline básico y caché en La Piruleta TPV
const CACHE_NAME = 'lapiruleta-tpv-v1';
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
