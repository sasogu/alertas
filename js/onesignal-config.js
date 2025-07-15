/**
 * OneSignal Configuration for Mindfulness Alerts
 * Configuraci            // Service Worker Path - compatible con WordPress  
            // WordPress OneSignal usa ruta específica
            serviceWorkerParam: { scope: "/app/" }, // Scope para subdirectorio
            serviceWorkerPath: "OneSignalSDKWorker.js", // Ruta relativa
            
            // Configuración específica para subdirectorio
            autoRegister: true,
            autoResubscribe: true,
            
            // Configuración adicional para WordPress OneSignal
            subdomain: "app",
            siteName: "Camino Medio",caciones push para alertas de mindfulness
 * 
 * ⚠️ IMPORTANTE: Las credenciales se cargan desde variables de entorno
 * Ver archivo .env.example para configuración
 */

// Función para obtener configuración de OneSignal
function getOneSignalConfig() {
    console.log('🔍 getOneSignalConfig() - Verificando configuraciones disponibles...');
    
    // Verificar configuración desde envConfig (método preferido)
    if (window.envConfig && window.envConfig.isConfigured()) {
        const appId = window.envConfig.get('ONESIGNAL_APP_ID');
        const safariWebId = window.envConfig.get('ONESIGNAL_SAFARI_WEB_ID');
        
        console.log('✅ Usando configuración desde envConfig:', { appId, safariWebId });
        
        return {
            appId: appId,
            safariWebId: safariWebId,
            
            // Configuración de notificaciones
            notificationClickHandlerMatch: "origin",
            notificationClickHandlerAction: "focus",
            allowLocalhostAsSecureOrigin: true,
            
            // Service Worker Path - compatible con WordPress
            // WordPress OneSignal usa ruta específica
            serviceWorkerParam: { scope: "/app/" }, // Scope para subdirectorio
            serviceWorkerPath: "OneSignalSDKWorker.js", // Ruta relativa
            
            // Configuración específica para subdirectorio
            autoRegister: true,
            autoResubscribe: true,
            
            // Configuración adicional para WordPress OneSignal
            subdomain: "app",
            siteName: "Camino Medio",
            
            welcomeNotification: {
                disable: true
            },
            
            promptOptions: {
                slidedown: {
                    enabled: true,
                    actionMessage: "¡Recibe recordatorios de mindfulness en tu dispositivo!",
                    acceptButtonText: "Permitir notificaciones",
                    cancelButtonText: "No, gracias",
                    siteName: "Camino Medio"
                }
            }
        };
    }
    
    // Fallback: verificar configuración simple
    if (window.ONESIGNAL_CONFIG && window.ONESIGNAL_CONFIG.APP_ID && 
        window.ONESIGNAL_CONFIG.APP_ID !== 'your_app_id_here') {
        
        console.log('✅ Usando configuración desde ONESIGNAL_CONFIG:', window.ONESIGNAL_CONFIG);
        
        return {
            appId: window.ONESIGNAL_CONFIG.APP_ID,
            safariWebId: window.ONESIGNAL_CONFIG.SAFARI_WEB_ID,
            allowLocalhostAsSecureOrigin: true,
            
            // Service Worker Path personalizado para subdirectorio /app/  
            path: "/app/",
            serviceWorkerPath: "/app/OneSignalSDKWorker.js",
            serviceWorkerUpdaterPath: "/app/OneSignalSDKUpdaterWorker.js",
            
            // Configuración específica para subdirectorio
            autoRegister: true,
            autoResubscribe: true,
            
            // Configuración adicional para subdirectorios
            subdomain: "app",
            siteName: "Camino Medio",
            
            welcomeNotification: {
                disable: true
            },
            
            promptOptions: {
                slidedown: {
                    enabled: true,
                    actionMessage: "¡Recibe recordatorios de mindfulness en tu dispositivo!",
                    acceptButtonText: "Permitir notificaciones", 
                    cancelButtonText: "No, gracias",
                    siteName: "Camino Medio"
                }
            }
        };
    }
    
    console.warn('⚠️ No se encontró configuración válida - usando defaults');
    
    // Configuración por defecto para desarrollo (deshabilitada)
    return {
        appId: "your_app_id_here", // ⚠️ Reemplazar con credenciales reales
        safariWebId: "your_safari_web_id_here",
        allowLocalhostAsSecureOrigin: true,
        
        welcomeNotification: {
            disable: true
        },
        
        promptOptions: {
            slidedown: {
                enabled: false // Deshabilitado hasta tener credenciales reales
            }
        }
    };
}

class OneSignalManager {
    constructor() {
        this.isInitialized = false;
        this.isSubscribed = false;
        this.playerId = null;
        this.config = null;
        
        // Esperar a que la configuración esté lista
        this.waitForConfig().then(() => {
            this.init();
        });
    }

    async waitForConfig() {
        // Esperar a que envConfig esté disponible
        return new Promise((resolve) => {
            const checkConfig = () => {
                if (window.envConfig && window.envConfig.isReady) {
                    console.log('📝 EnvConfig listo, procediendo con inicialización OneSignal');
                    resolve();
                } else {
                    console.log('⏳ Esperando EnvConfig...');
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });
    }

    async init() {
        try {
            console.log('🚀 Iniciando OneSignalManager...');
            
            // Obtener configuración actualizada
            this.config = getOneSignalConfig();
            console.log('📋 Configuración obtenida:', this.config);
            
            // Verificar si tenemos credenciales válidas
            if (!this.config.appId || this.config.appId === 'your_app_id_here') {
                console.warn('OneSignal not properly configured. Push notifications disabled.');
                this.updateStatusMessage('⚠️ Credenciales de OneSignal no configuradas');
                return;
            }
            
            // Verificar protocolo
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                console.warn('OneSignal requires HTTPS in production. Running on HTTP may cause issues.');
                this.updateStatusMessage('⚠️ OneSignal requiere HTTPS en producción');
            }
            
            // Verificar service workers antes de inicializar
            await this.checkServiceWorkers();
            
            // Esperar a que OneSignal esté disponible
            console.log('⏳ Esperando OneSignal SDK...');
            await this.waitForOneSignal();
            console.log('✅ OneSignal SDK disponible');
            
            // Inicializar OneSignal con timeout
            console.log('🔧 Inicializando OneSignal con config:', {
                appId: this.config.appId,
                safariWebId: this.config.safariWebId,
                path: this.config.path,
                serviceWorkerPath: this.config.serviceWorkerPath
            });
            
            // Usar timeout para evitar espera infinita
            const initPromise = OneSignal.init(this.config);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout inicializando OneSignal')), 10000)
            );
            
            await Promise.race([initPromise, timeoutPromise]);
            console.log('🎯 OneSignal.init() completado');
            
            // Verificar si realmente se inicializó
            if (OneSignal.User) {
                console.log('✅ OneSignal User API disponible');
                this.isInitialized = true;
            } else {
                throw new Error('OneSignal no se inicializó completamente');
            }
            
            // Configurar eventos
            this.setupEventHandlers();
            
            // Verificar estado de suscripción
            await this.checkSubscriptionStatus();
            
            console.log('✅ OneSignal initialized successfully');
            this.updateStatusMessage('✅ OneSignal inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error initializing OneSignal:', error);
            this.updateStatusMessage(`❌ Error: ${error.message}`);
            
            // Sugerir soluciones
            if (error.message.includes('Timeout')) {
                console.warn('💡 Posibles soluciones:');
                console.warn('1. Verificar que el App ID está configurado para este dominio en OneSignal Dashboard');
                console.warn('2. Verificar que los service workers son accesibles');
                console.warn('3. Verificar configuración de CORS en el servidor');
            }
        }
    }

    async checkServiceWorkers() {
        const workerPaths = [
            this.config.serviceWorkerPath || '/app/OneSignalSDKWorker.js',
            this.config.serviceWorkerUpdaterPath || '/app/OneSignalSDKUpdaterWorker.js'
        ];

        console.log('🔍 Verificando service workers...');
        
        for (const path of workerPaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const content = await response.text();
                    console.log(`✅ Service worker encontrado: ${path}`);
                    console.log(`📝 Contenido: ${content.substring(0, 100)}...`);
                } else {
                    console.warn(`⚠️ Service worker no accesible: ${path} (${response.status})`);
                }
            } catch (error) {
                console.error(`❌ Error verificando service worker ${path}:`, error.message);
            }
        }
    }

    updateStatusMessage(message) {
        // Método helper para actualizar mensajes de estado
        if (typeof window !== 'undefined' && window.console) {
            console.log(`[OneSignalManager] ${message}`);
        }
    }

    waitForOneSignal() {
        return new Promise((resolve) => {
            if (window.OneSignal) {
                resolve();
            } else {
                const checkOneSignal = () => {
                    if (window.OneSignal) {
                        resolve();
                    } else {
                        setTimeout(checkOneSignal, 100);
                    }
                };
                checkOneSignal();
            }
        });
    }

    setupEventHandlers() {
        // Evento cuando el usuario se suscribe
        OneSignal.on('subscriptionChange', (isSubscribed) => {
            console.log('Subscription changed:', isSubscribed);
            this.isSubscribed = isSubscribed;
            this.updateSubscriptionUI();
            
            if (isSubscribed) {
                this.sendWelcomeNotification();
            }
        });

        // Evento cuando se recibe una notificación
        OneSignal.on('notificationDisplay', (event) => {
            console.log('Notification displayed:', event);
        });

        // Evento cuando se hace clic en una notificación
        OneSignal.on('notificationClick', (event) => {
            console.log('Notification clicked:', event);
            
            // Si la notificación es de mindfulness, enfocar la ventana
            if (event.notification.additionalData && 
                event.notification.additionalData.type === 'mindfulness-alert') {
                window.focus();
            }
        });
    }

    async checkSubscriptionStatus() {
        try {
            this.isSubscribed = await OneSignal.getNotificationPermission() === 'granted';
            this.playerId = await OneSignal.getUserId();
            
            this.updateSubscriptionUI();
            
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    }

    async requestPermission() {
        try {
            if (!this.isInitialized) {
                throw new Error('OneSignal not initialized');
            }

            // Mostrar el prompt nativo de OneSignal
            const permission = await OneSignal.requestPermission();
            
            if (permission) {
                this.isSubscribed = true;
                this.playerId = await OneSignal.getUserId();
                this.updateSubscriptionUI();
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    }

    async sendMindfulnessAlert(message = "🧘‍♀️ Momento de Mindfulness") {
        if (!this.isSubscribed || !this.playerId) {
            console.warn('User not subscribed to notifications');
            return false;
        }

        try {
            // Nota: Para enviar notificaciones, normalmente necesitas un backend
            // Aquí mostramos cómo sería la estructura de datos
            const notificationData = {
                app_id: this.config.appId,
                include_player_ids: [this.playerId],
                headings: {
                    en: "Camino Medio",
                    es: "Camino Medio"
                },
                contents: {
                    en: message,
                    es: message
                },
                data: {
                    type: "mindfulness-alert",
                    timestamp: Date.now()
                },
                large_icon: "https://www.caminomedio.org/assets/img/logocompleto.png",
                small_icon: "https://www.caminomedio.org/assets/img/logopeque.png",
                android_sound: "notification",
                ios_sound: "notification.wav",
                web_buttons: [
                    {
                        id: "open-app",
                        text: "Abrir App",
                        url: window.location.origin + "/alertas/"
                    }
                ]
            };

            // En un entorno real, enviarías esto a tu backend
            // que luego haría la llamada a la API de OneSignal
            console.log('Notification data:', notificationData);
            
            // Para fines de demostración, mostramos una notificación local
            this.showLocalNotification(message);
            
            return true;
            
        } catch (error) {
            console.error('Error sending mindfulness alert:', error);
            return false;
        }
    }

    showLocalNotification(message) {
        // Fallback para mostrar notificación local si las push no están disponibles
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Camino Medio', {
                body: message,
                icon: '../assets/img/logocompleto.png',
                badge: '../assets/img/logopeque.png',
                tag: 'mindfulness-alert',
                requireInteraction: false,
                actions: [
                    {
                        action: 'open',
                        title: 'Abrir App'
                    }
                ]
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto cerrar después de 10 segundos
            setTimeout(() => {
                notification.close();
            }, 10000);
        }
    }

    updateSubscriptionUI() {
        const checkbox = document.getElementById('push-notifications-enabled');
        const statusElement = document.getElementById('push-status');
        
        if (checkbox) {
            checkbox.checked = this.isSubscribed;
        }
        
        if (statusElement) {
            if (this.isSubscribed) {
                statusElement.style.display = 'block';
                statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Notificaciones habilitadas</span>';
            } else {
                statusElement.style.display = 'none';
            }
        }
    }

    async unsubscribe() {
        try {
            if (this.isInitialized) {
                await OneSignal.setSubscription(false);
                this.isSubscribed = false;
                this.updateSubscriptionUI();
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    }

    // Método para programar notificaciones periódicas
    // Nota: Esto requeriría un backend para implementar completamente
    async schedulePeriodicAlerts(intervalMinutes, totalDuration) {
        if (!this.isSubscribed) {
            console.warn('User not subscribed');
            return false;
        }

        console.log(`Scheduling alerts every ${intervalMinutes} minutes for ${totalDuration} total duration`);
        
        // En un entorno real, enviarías esta configuración a tu backend
        // que se encargaría de enviar las notificaciones en los intervalos correctos
        
        const scheduleData = {
            userId: this.playerId,
            intervalMinutes: intervalMinutes,
            totalDuration: totalDuration,
            startTime: Date.now()
        };
        
        // Aquí harías una llamada a tu API backend
        // await fetch('/api/schedule-mindfulness-alerts', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(scheduleData)
        // });
        
        console.log('Schedule data:', scheduleData);
        return true;
    }

    async cancelScheduledAlerts() {
        if (!this.playerId) return false;
        
        // Cancelar alertas programadas en el backend
        console.log('Canceling scheduled alerts for user:', this.playerId);
        
        // await fetch('/api/cancel-mindfulness-alerts', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userId: this.playerId })
        // });
        
        return true;
    }

    async sendWelcomeNotification() {
        // Enviar notificación de bienvenida
        await this.sendMindfulnessAlert(
            "¡Bienvenido! Ya puedes recibir recordatorios de mindfulness aunque tu teléfono esté inactivo 🧘‍♀️"
        );
    }
}

// Exportar para uso global
window.OneSignalManager = OneSignalManager;

// Crear instancia global para usar inmediatamente
window.oneSignalManager = new OneSignalManager();
