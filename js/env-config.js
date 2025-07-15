/**
 * Environment Configuration Loader
 * Configuración optimizada para https://alertas.caminomedio.org/
 */

class EnvConfig {
    constructor() {
        this.config = {};
        this.isReady = false;
        this.init();
    }

    async init() {
        try {
            // Intentar cargar desde servidor primero
            await this.loadFromEndpoint();
        } catch (error) {
            // Fallback: cargar configuración local para desarrollo
            this.loadFromLocalConfig();
        }
        this.isReady = true;
        console.log('🎯 EnvConfig inicializado para alertas.caminomedio.org');
    }

    async loadFromEndpoint() {
        try {
            console.log('🔌 Intentando cargar configuración desde servidor...');
            const response = await fetch('/api/config');
            if (response.ok) {
                this.config = await response.json();
                this.config.server_loaded = true;
                console.log('✅ Configuración cargada desde servidor');
                return;
            }
            throw new Error('Config endpoint not available');
        } catch (error) {
            console.warn('⚠️ No se pudo cargar config desde servidor:', error.message);
            throw error;
        }
    }

    loadFromLocalConfig() {
        // Configuración para https://alertas.caminomedio.org/
        // ⚠️ En producción esto vendría del servidor backend
        this.config = {
            // 🎯 CONFIGURAR PARA NUEVO DOMINIO alertas.caminomedio.org
            ONESIGNAL_APP_ID: 'NUEVA_APP_ID_PARA_ALERTAS_SUBDOMINIO', 
            ONESIGNAL_SAFARI_WEB_ID: 'web.onesignal.auto.NUEVO_SAFARI_ID',
            server_loaded: false,
            domain: 'alertas.caminomedio.org',
            https_required: true
        };
        
        console.log('🔧 Usando configuración local para desarrollo');
        console.log('🌐 Dominio objetivo: https://alertas.caminomedio.org/');
        console.log('💡 App ID configurado:', this.config.ONESIGNAL_APP_ID);
        console.log('🎯 REQUERIDO: Crear nueva app OneSignal para alertas.caminomedio.org');
        console.log('📋 Pasos siguientes:');
        console.log('   1. Crear app en OneSignal para alertas.caminomedio.org');
        console.log('   2. Actualizar ONESIGNAL_APP_ID en este archivo');
        console.log('   3. Actualizar ONESIGNAL_SAFARI_WEB_ID');
        console.log('   4. Desplegar en https://alertas.caminomedio.org/');
    }

    get(key) {
        return this.config[key];
    }

    isConfigured() {
        const appId = this.config.ONESIGNAL_APP_ID;
        const isValid = appId && 
                       appId !== 'your_app_id_here' &&
                       appId !== 'NUEVA_APP_ID_PARA_ALERTAS_SUBDOMINIO' &&
                       appId.length > 10;
        
        console.log(`🔍 isConfigured() check: ${isValid}, App ID: ${appId}`);
        return isValid;
    }

    // Método para verificar si estamos en modo desarrollo
    isDevelopment() {
        return !this.config.server_loaded;
    }

    // Método para esperar a que la configuración esté lista
    async waitForReady() {
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }

    // Método para verificar dominio correcto
    isCorrectDomain() {
        const currentDomain = window.location.hostname;
        const expectedDomain = 'alertas.caminomedio.org';
        
        if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
            console.log('🧪 Ejecutando en desarrollo local');
            return true;
        }
        
        const isCorrect = currentDomain === expectedDomain;
        console.log(`🌐 Verificación de dominio: ${isCorrect}`);
        console.log(`   Actual: ${currentDomain}`);
        console.log(`   Esperado: ${expectedDomain}`);
        
        return isCorrect;
    }
}

// Crear instancia global inmediatamente
window.envConfig = new EnvConfig();
