/**
 * Service Worker Principal - CaminoMedio Alertas PWA
 * Gestiona cache, funcionalidad offline y actualización de la app
 */

const CACHE_NAME = 'caminomedio-alertas-v1.2.0';
const STATIC_CACHE = 'static-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-v1.2.0';

// Archivos críticos para cachear
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/test-onesignal.html',
    '/manifest.json',
    '/css/alertas.css',
    '/js/alertas.js',
    '/js/env-config.js',
    '/js/onesignal-config.js',
    '/js/simple-config.js',
    '/api/config.json',
    // Iconos
    '/assets/icons/192x192.png',
    '/assets/icons/512x512.png',
    '/assets/icons/24x24.png',
    '/assets/icons/48x48.png',
    // Sonidos (si existen)
    '/sounds/bell1.mp3',
    '/sounds/bell2.mp3',
    '/sounds/bell3.mp3',
    '/sounds/bell4.mp3',
    '/sounds/bell5.mp3',
    // CDN críticos
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// URLs que NO deben cachearse
const NO_CACHE_URLS = [
    '/api/config', // Endpoint dinámico
    'chrome-extension://',
    'https://cdn.onesignal.com/' // OneSignal maneja su propio cache
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando versión', CACHE_NAME);
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Service Worker: Cacheando archivos estáticos...');
                return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
            })
            .then(() => {
                console.log('✅ Service Worker: Instalación completada');
                // Solo skipWaiting si es la primera instalación
                if (!self.registration.active) {
                    console.log('🚀 Service Worker: Primera instalación, activando inmediatamente');
                    return self.skipWaiting();
                } else {
                    console.log('⏳ Service Worker: Esperando activación manual para actualización');
                }
            })
            .catch(error => {
                console.error('❌ Service Worker: Error en instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Eliminar caches antiguos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activación completada');
                // Tomar control inmediato de todas las pestañas
                return self.clients.claim();
            })
    );
});

// Intercepción de peticiones (estrategia Cache First para estáticos, Network First para dinámicos)
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // No cachear URLs específicas
    if (NO_CACHE_URLS.some(pattern => url.includes(pattern))) {
        return;
    }
    
    // Solo manejar peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(event.request)
    );
});

async function handleFetchRequest(request) {
    const url = request.url;
    
    try {
        // Estrategia para archivos estáticos (Cache First)
        if (STATIC_ASSETS.some(asset => url.includes(asset))) {
            return await cacheFirst(request);
        }
        
        // Estrategia para API y contenido dinámico (Network First)
        if (url.includes('/api/') || url.includes('cdn.onesignal.com')) {
            return await networkFirst(request);
        }
        
        // Por defecto: Cache First con fallback a Network
        return await cacheFirst(request);
        
    } catch (error) {
        console.warn('⚠️ Service Worker: Error en fetch:', error);
        
        // Fallback offline para navegación
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        // Para otros recursos, devolver respuesta de error
        return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Cache First
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Actualizar en background
        fetch(request)
            .then(response => updateCache(request, response.clone()))
            .catch(() => {}); // Ignorar errores de red
        
        return cachedResponse;
    }
    
    // Si no está en cache, obtener de la red y cachear
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
}

// Estrategia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        await updateCache(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        // Si falla la red, usar cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Actualizar cache dinámicamente
async function updateCache(request, response) {
    // Solo cachear respuestas exitosas
    if (response.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response);
    }
}

// Mensaje de comunicación con la aplicación principal
self.addEventListener('message', event => {
    console.log('📨 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⏭️ Service Worker: Ejecutando skipWaiting()...');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Notificaciones push (integración con OneSignal)
self.addEventListener('push', event => {
    console.log('📧 Service Worker: Push recibido');
    // OneSignal maneja las notificaciones push
    // Este listener es para compatibilidad futura
});

// Click en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('🔔 Service Worker: Click en notificación');
    event.notification.close();
    
    // Abrir o enfocar la aplicación
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Si hay una ventana abierta, enfocarla
                for (let client of clientList) {
                    if (client.url.includes(location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

console.log('🟢 Service Worker: Cargado y listo');
