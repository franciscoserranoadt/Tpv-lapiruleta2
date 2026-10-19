// Service Worker v2 para soporte offline y caché en La Piruleta TPV
const CACHE_NAME = 'lapiruleta-tpv-v2';

// Lista completa de todos los recursos y pantallas del repositorio con rutas relativas
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

// Instalación: almacena en caché todos los archivos del TPV
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia versiones de caché antiguas para que los cambios se reflejen de inmediato
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

// Intercepción de peticiones de red: busca primero en caché y si no, hace petición de red limpia
self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET dentro del mismo origen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // En caso de estar sin conexión y fallar, devolver la pantalla principal si es una navegación
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
