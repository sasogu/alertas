/**
 * Simple OneSignal Test Configuration
 * Configuración directa para pruebas inmediatas
 */

// Configuración directa para pruebas inmediatas
window.ONESIGNAL_CONFIG = {
    // Usar las mismas credenciales válidas
    APP_ID: '75f7bf03-ba86-4059-99cc-797fe53a147d',
    SAFARI_WEB_ID: 'web.onesignal.auto.3f550615-46c0-4fa5-9ee8-42953ece3d19'
};

console.log('🎯 Configuración OneSignal cargada directamente');
console.log('📱 App ID:', window.ONESIGNAL_CONFIG.APP_ID);

// Verificar que esté disponible inmediatamente
window.isOneSignalConfigReady = true;
