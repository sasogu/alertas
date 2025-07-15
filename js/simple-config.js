/**
 * Simple OneSignal Test Configuration
 * Configuración directa para pruebas inmediatas
 */

// Configuración directa para pruebas inmediatas
window.ONESIGNAL_CONFIG = {
    // NUEVA APP REQUERIDA PARA caminomedio.org (sin www)
    APP_ID: 'NUEVA_APP_ID_AQUI', // ⚠️ Crear nueva app para caminomedio.org
    SAFARI_WEB_ID: 'NUEVO_SAFARI_WEB_ID_AQUI' // ⚠️ Safari Web ID de nueva app
};

console.log('🎯 Configuración OneSignal cargada directamente');
console.log('📱 App ID:', window.ONESIGNAL_CONFIG.APP_ID);

// Verificar que esté disponible inmediatamente
window.isOneSignalConfigReady = true;
