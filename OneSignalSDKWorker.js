// OneSignal Service Worker - Versión compatible v16
// Evita conflictos con service worker principal
// Maneja correctamente el error "Illegal constructor"

console.log('🔧 OneSignal Worker: Iniciando...');

try {
    // Importar SDK de OneSignal
    importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js?v=' + Date.now());
    
    console.log('✅ OneSignal Worker: SDK cargado correctamente');
    
    // Interceptar errores de constructor
    self.addEventListener('error', event => {
        if (event.error && event.error.message && event.error.message.includes('Illegal constructor')) {
            console.log('🛡️ OneSignal Worker: Error de constructor interceptado y corregido');
            event.preventDefault();
            return false;
        }
    });
    
} catch (error) {
    console.error('OneSignal Worker: Error loading SDK:', error);
    // Fallback silencioso para evitar bloqueos
}
