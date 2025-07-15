/**
 * Alertas de Mindfulness - Sistema de recordatorios conscientes
 * Funcionalidad para reproducir sonidos/vibraciones en intervalos configurables
 */

class MindfulnessAlerts {
    constructor() {
        this.isActive = false;
        this.intervalId = null;
        this.config = this.loadConfig();
        this.stats = this.loadStats();
        this.sessionStartTime = null;
        this.audioContext = null;
        this.oneSignalManager = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando MindfulnessAlerts...');
        
        this.setupEventListeners();
        this.updateUI();
        this.updateStats();
        this.checkBrowserSupport();
        
        // Inicializar OneSignal
        console.log('🔄 Iniciando inicialización OneSignal...');
        await this.initializeOneSignal();
        
        // Restore session if was active
        if (this.config.wasActive) {
            console.log('🔄 Restaurando sesión activa...');
            this.startAlerts();
        }
        
        console.log('✅ MindfulnessAlerts inicializado completamente');
    }

    async initializeOneSignal() {
        try {
            console.log('🔄 Configurando integración OneSignal...');
            
            // Esperar a que OneSignal esté disponible
            await this.waitForOneSignal();
            
            this.oneSignalManager = window.oneSignalManager;
            console.log('✅ OneSignal integration ready');
            
            // Disparar evento para indicar que OneSignal está listo
            window.dispatchEvent(new CustomEvent('oneSignalReady', {
                detail: { manager: this.oneSignalManager }
            }));
            
        } catch (error) {
            console.error('❌ Error initializing OneSignal:', error);
            this.oneSignalManager = null;
            
            // Disparar evento de error
            window.dispatchEvent(new CustomEvent('oneSignalError', {
                detail: { error: error.message }
            }));
        }
    }
    
    async waitForOneSignal() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('OneSignal timeout después de 15 segundos'));
            }, 15000);
            
            const checkOneSignal = () => {
                if (window.oneSignalManager && window.oneSignalManager.isInitialized) {
                    clearTimeout(timeout);
                    console.log('✅ OneSignal encontrado y inicializado');
                    resolve();
                } else {
                    // Log para debug
                    const mgr = window.oneSignalManager;
                    console.log(`🔄 Esperando OneSignal... Manager: ${!!mgr}, Inicializado: ${mgr?.isInitialized}`);
                    setTimeout(checkOneSignal, 200);
                }
            };
            
            checkOneSignal();
        });
    }

    setupEventListeners() {
        // Toggle button
        document.getElementById('toggle-btn').addEventListener('click', () => {
            this.toggleAlerts();
        });

        // Configuration controls
        document.getElementById('interval-minutes').addEventListener('change', () => {
            this.updateInterval();
        });

        document.getElementById('interval-seconds').addEventListener('change', () => {
            this.updateInterval();
        });

        document.getElementById('preset-intervals').addEventListener('change', (e) => {
            this.setPresetInterval(e.target.value);
        });

        document.getElementById('sound-select').addEventListener('change', (e) => {
            this.config.soundType = e.target.value;
            this.updateAudioSource();
        });

        document.getElementById('test-sound').addEventListener('click', () => {
            this.playTestSound();
        });

        document.getElementById('volume-control').addEventListener('input', (e) => {
            this.config.volume = parseInt(e.target.value);
            document.getElementById('volume-display').textContent = `${e.target.value}%`;
            this.updateAudioVolume();
        });

        document.getElementById('vibration-enabled').addEventListener('change', (e) => {
            this.config.vibrationEnabled = e.target.checked;
        });

        document.getElementById('push-notifications-enabled').addEventListener('change', async (e) => {
            const checkbox = e.target;
            const statusElement = document.getElementById('push-status');
            
            if (checkbox.checked) {
                // Deshabilitar checkbox temporalmente
                checkbox.disabled = true;
                
                // Solicitar permisos de notificación push
                const granted = await this.requestPushNotifications();
                
                if (granted) {
                    // Mostrar estado exitoso
                    if (statusElement) {
                        statusElement.style.display = 'block';
                        statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Notificaciones habilitadas</span>';
                    }
                } else {
                    // Revertir checkbox si falló
                    checkbox.checked = false;
                    if (statusElement) {
                        statusElement.style.display = 'none';
                    }
                }
                
                // Rehabilitar checkbox
                checkbox.disabled = false;
                
            } else {
                // Desactivar notificaciones push
                await this.disablePushNotifications();
                if (statusElement) {
                    statusElement.style.display = 'none';
                }
            }
            
            this.config.pushNotificationsEnabled = checkbox.checked;
            this.saveConfig();
        });

        document.getElementById('auto-stop-enabled').addEventListener('change', (e) => {
            this.config.autoStopEnabled = e.target.checked;
            document.getElementById('auto-stop-duration').disabled = !e.target.checked;
        });

        document.getElementById('auto-stop-duration').addEventListener('change', (e) => {
            this.config.autoStopDuration = parseInt(e.target.value);
        });

        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfig();
            this.showToast('Configuración guardada', 'success');
        });

        document.getElementById('reset-stats').addEventListener('click', () => {
            this.resetStats();
        });

        // Page visibility handling
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Before unload - save state
        window.addEventListener('beforeunload', () => {
            this.config.wasActive = this.isActive;
            this.saveConfig();
        });
        
        // OneSignal event listeners
        window.addEventListener('oneSignalReady', (event) => {
            console.log('🎉 OneSignal listo - actualizando UI');
            this.oneSignalManager = event.detail.manager;
            this.updateOneSignalUI();
        });
        
        window.addEventListener('oneSignalError', (event) => {
            console.error('❌ Error OneSignal:', event.detail.error);
            this.showToast('Error en OneSignal: ' + event.detail.error, 'error');
        });
    }

    toggleAlerts() {
        if (this.isActive) {
            this.stopAlerts();
        } else {
            this.startAlerts();
        }
    }

    async startAlerts() {
        if (this.config.intervalSeconds <= 0) {
            this.showToast('Por favor, configura un intervalo válido', 'error');
            return;
        }

        this.isActive = true;
        this.sessionStartTime = Date.now();
        
        // Si las notificaciones push están habilitadas, programar en OneSignal
        if (this.config.pushNotificationsEnabled && this.oneSignalManager && window.OneSignal && window.OneSignal.User.PushSubscription.optedIn) {
            await this.scheduleServerSideAlerts();
        }
        
        this.scheduleNextAlert();
        this.updateUI();
        this.showToast('Alertas activadas', 'success');
        
        // Request notification permission if needed
        this.requestNotificationPermission();
    }

    async stopAlerts() {
        this.isActive = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        
        // Cancelar alertas programadas en el servidor
        if (this.config.pushNotificationsEnabled && this.oneSignalManager && window.OneSignal && window.OneSignal.User.PushSubscription.optedIn) {
            await this.cancelServerSideAlerts();
        }
        
        this.updateUI();
        this.updateSessionTime();
        this.showToast('Alertas desactivadas', 'info');
    }

    scheduleNextAlert() {
        if (!this.isActive) return;

        const intervalMs = this.config.intervalSeconds * 1000;
        
        this.intervalId = setTimeout(() => {
            this.triggerAlert();
            this.scheduleNextAlert();
        }, intervalMs);

        this.updateNextAlertTime();
    }

    triggerAlert() {
        // Play sound (solo si la página está activa)
        if (!document.hidden) {
            this.playAlertSound();
        }
        
        // Trigger vibration
        if (this.config.vibrationEnabled) {
            this.triggerVibration();
        }
        
        // Show push notification si está habilitado, sino notificación web normal
        if (this.config.pushNotificationsEnabled && this.oneSignalManager && window.OneSignal && window.OneSignal.User.PushSubscription.optedIn) {
            this.sendPushNotification();
        } else {
            this.showNotification();
        }
        
        // Update statistics
        this.stats.alertsToday++;
        this.stats.totalAlerts++;
        this.updateStats();
        this.saveStats();
        
        // Flash UI (solo si la página está visible)
        if (!document.hidden) {
            this.flashUI();
        }
        
        // Check auto-stop
        this.checkAutoStop();
    }

    playAlertSound() {
        const audio = document.getElementById('alert-audio');
        audio.volume = this.config.volume / 100;
        
        audio.currentTime = 0;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio playback failed:', error);
                // Fallback to system sound or visual alert
                this.triggerVisualAlert();
            });
        }
    }

    playTestSound() {
        this.playAlertSound();
        if (this.config.vibrationEnabled) {
            this.triggerVibration();
        }
    }

    triggerVibration() {
        if ('vibrate' in navigator) {
            // Pattern: short-pause-long-pause-short
            navigator.vibrate([200, 100, 400, 100, 200]);
        }
    }

    triggerVisualAlert() {
        document.body.classList.add('alert-flash');
        setTimeout(() => {
            document.body.classList.remove('alert-flash');
        }, 500);
    }

    showNotification(customMessage = null) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = customMessage || 'Toma un momento para respirar conscientemente';
            
            const notification = new Notification('Momento de Mindfulness', {
                body: message,
                icon: '/assets/icons/192x192.png',
                badge: '/assets/icons/192x192.png',
                tag: 'mindfulness-alert',
                requireInteraction: false,
                silent: false
            });

            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    flashUI() {
        const statusIndicator = document.getElementById('status-indicator');
        statusIndicator.style.transform = 'scale(1.2)';
        statusIndicator.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            statusIndicator.style.transform = 'scale(1)';
        }, 300);
    }

    updateInterval() {
        const minutes = parseInt(document.getElementById('interval-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
        
        this.config.intervalSeconds = (minutes * 60) + seconds;
        
        // Clear preset selection if manual input
        document.getElementById('preset-intervals').value = '';
        
        if (this.isActive) {
            this.stopAlerts();
            this.startAlerts();
        }
    }

    setPresetInterval(seconds) {
        if (!seconds) return;
        
        const totalSeconds = parseInt(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        
        document.getElementById('interval-minutes').value = minutes;
        document.getElementById('interval-seconds').value = remainingSeconds;
        
        this.config.intervalSeconds = totalSeconds;
        
        if (this.isActive) {
            this.stopAlerts();
            this.startAlerts();
        }
    }

    updateAudioSource() {
        const audioSource = document.getElementById('audio-source');
        audioSource.src = `sounds/${this.config.soundType}.mp3`;
        
        const audio = document.getElementById('alert-audio');
        audio.load();
    }

    updateAudioVolume() {
        const audio = document.getElementById('alert-audio');
        audio.volume = this.config.volume / 100;
    }

    updateUI() {
        const toggleBtn = document.getElementById('toggle-btn');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (this.isActive) {
            toggleBtn.innerHTML = '<i class="fas fa-stop me-2"></i>Detener Alertas';
            toggleBtn.className = 'btn btn-danger btn-lg';
            
            statusIndicator.className = 'status-active mb-3';
            statusIndicator.innerHTML = '<i class="fas fa-bell fa-3x"></i>';
            statusText.textContent = 'Alertas Activas';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-play me-2"></i>Activar Alertas';
            toggleBtn.className = 'btn btn-primary btn-lg';
            
            statusIndicator.className = 'status-inactive mb-3';
            statusIndicator.innerHTML = '<i class="fas fa-bell-slash fa-3x"></i>';
            statusText.textContent = 'Alertas Desactivadas';
            
            document.getElementById('next-alert').textContent = '';
        }

        this.updateNextAlertTime();
        
        // Inicializar estado OneSignal
        this.initializeOneSignalUI();
    }
    
    initializeOneSignalUI() {
        const pushCheckbox = document.getElementById('push-notifications-enabled');
        const pushStatus = document.getElementById('push-status');
        
        if (pushCheckbox) {
            // Deshabilitar hasta que OneSignal esté listo
            pushCheckbox.disabled = !this.oneSignalManager;
            
            // Si OneSignal está listo, actualizar estado
            if (this.oneSignalManager && window.OneSignal) {
                try {
                    const optedIn = window.OneSignal.User.PushSubscription.optedIn;
                    pushCheckbox.checked = optedIn;
                    
                    if (pushStatus && optedIn) {
                        pushStatus.style.display = 'block';
                        pushStatus.innerHTML = '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Notificaciones habilitadas</span>';
                    }
                } catch (error) {
                    console.error('Error inicializando UI OneSignal:', error);
                }
            }
        }
    }

    updateNextAlertTime() {
        if (!this.isActive) return;
        
        const nextAlertElement = document.getElementById('next-alert');
        const intervalMs = this.config.intervalSeconds * 1000;
        
        const updateCountdown = () => {
            if (!this.isActive) return;
            
            const now = Date.now();
            const nextAlert = this.sessionStartTime + intervalMs;
            const remaining = Math.max(0, nextAlert - now);
            
            if (remaining > 0) {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                nextAlertElement.textContent = `Próxima alerta en: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                nextAlertElement.textContent = 'Alerta inmediata...';
            }
        };
        
        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    updateStats() {
        document.getElementById('alerts-count').textContent = this.stats.alertsToday;
        document.getElementById('mindful-moments').textContent = this.stats.totalAlerts;
        this.updateSessionTime();
    }

    updateSessionTime() {
        if (this.sessionStartTime) {
            const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            document.getElementById('session-time').textContent = `${sessionTime}m`;
        }
    }

    checkAutoStop() {
        if (!this.config.autoStopEnabled) return;
        
        const duration = this.config.autoStopDuration;
        
        if (duration <= 60) { // Count-based
            if (this.stats.alertsToday >= duration) {
                this.stopAlerts();
                this.showToast(`Sesión completada: ${duration} alertas alcanzadas`, 'success');
            }
        } else { // Time-based (minutes)
            const sessionMinutes = (Date.now() - this.sessionStartTime) / 60000;
            if (sessionMinutes >= duration) {
                this.stopAlerts();
                this.showToast(`Sesión completada: ${duration} minutos alcanzados`, 'success');
            }
        }
    }

    resetStats() {
        if (confirm('¿Estás seguro de que quieres reiniciar las estadísticas?')) {
            this.stats = {
                alertsToday: 0,
                totalAlerts: 0,
                lastResetDate: new Date().toDateString()
            };
            this.saveStats();
            this.updateStats();
            this.showToast('Estadísticas reiniciadas', 'info');
        }
    }

    checkBrowserSupport() {
        // Check for audio support
        const audio = document.getElementById('alert-audio');
        if (!audio.canPlayType('audio/mpeg')) {
            console.warn('MP3 audio not supported');
        }

        // Check for vibration support
        if (!('vibrate' in navigator)) {
            document.getElementById('vibration-enabled').disabled = true;
            document.querySelector('label[for="vibration-enabled"]').style.opacity = '0.5';
        }

        // Check for notification support
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showToast('Notificaciones habilitadas', 'success');
                }
            });
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - could adjust behavior
            console.log('Page hidden - alerts continue in background');
        } else {
            // Page is visible again
            this.updateStats();
        }
    }

    loadConfig() {
        const defaultConfig = {
            intervalSeconds: 300, // 5 minutes
            soundType: 'bell1',
            volume: 70,
            vibrationEnabled: true,
            pushNotificationsEnabled: false,
            autoStopEnabled: false,
            autoStopDuration: 10,
            wasActive: false
        };

        try {
            const saved = localStorage.getItem('mindfulness-alerts-config');
            return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
        } catch (error) {
            console.error('Error loading config:', error);
            return defaultConfig;
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('mindfulness-alerts-config', JSON.stringify(this.config));
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    loadStats() {
        const defaultStats = {
            alertsToday: 0,
            totalAlerts: 0,
            lastResetDate: new Date().toDateString()
        };

        try {
            const saved = localStorage.getItem('mindfulness-alerts-stats');
            const stats = saved ? JSON.parse(saved) : defaultStats;
            
            // Reset daily stats if new day
            if (stats.lastResetDate !== new Date().toDateString()) {
                stats.alertsToday = 0;
                stats.lastResetDate = new Date().toDateString();
            }
            
            return stats;
        } catch (error) {
            console.error('Error loading stats:', error);
            return defaultStats;
        }
    }

    saveStats() {
        try {
            localStorage.setItem('mindfulness-alerts-stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Show toast
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();

        // Remove after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // OneSignal Push Notification Methods
    async requestPushNotifications() {
        // Verificar si OneSignal está disponible o intentar esperarlo
        if (!this.oneSignalManager) {
            this.showToast('Inicializando OneSignal, por favor espera...', 'info');
            
            try {
                // Intentar esperar a que OneSignal se inicialice
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Timeout esperando OneSignal'));
                    }, 5000);
                    
                    const checkReady = () => {
                        if (this.oneSignalManager && window.oneSignalManager && window.oneSignalManager.isInitialized) {
                            clearTimeout(timeout);
                            this.oneSignalManager = window.oneSignalManager;
                            resolve();
                        } else {
                            setTimeout(checkReady, 200);
                        }
                    };
                    
                    // También escuchar el evento
                    window.addEventListener('oneSignalReady', () => {
                        clearTimeout(timeout);
                        this.oneSignalManager = window.oneSignalManager;
                        resolve();
                    }, { once: true });
                    
                    checkReady();
                });
                
            } catch (waitError) {
                this.showToast('OneSignal no está disponible. Intenta recargar la página.', 'error');
                return false;
            }
        }

        try {
            // Usar el nuevo método de suscripción
            const subscriptionId = await this.oneSignalManager.subscribe();
            
            if (subscriptionId || window.OneSignal.User.PushSubscription.optedIn) {
                this.showToast('¡Notificaciones push habilitadas! Ahora recibirás alertas aunque el teléfono esté inactivo', 'success');
                return true;
            } else {
                this.showToast('No se pudo completar la suscripción', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error requesting push notifications:', error);
            this.showToast('Error al solicitar notificaciones push: ' + error.message, 'error');
            return false;
        }
    }

    async disablePushNotifications() {
        if (this.oneSignalManager) {
            try {
                await this.oneSignalManager.unsubscribe();
                this.showToast('Notificaciones push deshabilitadas', 'info');
            } catch (error) {
                console.error('Error disabling push notifications:', error);
                this.showToast('Error deshabilitando notificaciones', 'error');
            }
        }
    }

    async sendPushNotification() {
        // Verificar si OneSignal está disponible y el usuario está suscrito
        const canSendPush = this.oneSignalManager && 
                           window.OneSignal && 
                           window.OneSignal.User.PushSubscription.optedIn;

        if (!canSendPush) {
            // Fallback a notificación web normal
            this.showNotification();
            return;
        }

        const messages = [
            "🧘‍♀️ Momento de respirar conscientemente",
            "🌸 Pausa y observa el momento presente", 
            "🍃 Toma tres respiraciones profundas",
            "💫 Conecta contigo mismo/a",
            "🌊 Fluye con la tranquilidad del ahora",
            "🕯️ Enciende la luz de tu atención",
            "🦋 Suelta y permite que la paz llegue",
            "🌅 Abraza este momento de serenidad"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        try {
            // Verificar permisos antes de enviar
            const permission = window.OneSignal.Notifications.permission;
            const hasPermission = permission === 'granted' || permission === true;
            
            if (!hasPermission) {
                console.log('📱 Sin permisos, enviando notificación local...');
                this.showBrowserNotification(randomMessage);
                return;
            }

            // Intentar enviar notificación usando el método mejorado de OneSignal
            if (this.oneSignalManager && typeof this.oneSignalManager.sendTestNotification === 'function') {
                console.log('📱 Enviando notificación push via OneSignal...');
                await this.oneSignalManager.sendTestNotification();
            } else {
                // Fallback: Notificación del navegador
                console.log('📱 Enviando notificación local...');
                this.showBrowserNotification(randomMessage);
            }
            
            console.log(`📱 Notificación enviada: ${randomMessage}`);
            
        } catch (error) {
            console.error('Error sending push notification:', error);
            // Fallback a notificación web
            this.showBrowserNotification(randomMessage);
        }
    }

    showBrowserNotification(message = null) {
        if (!message) {
            message = "🧘 Momento de Atención Plena - Toma una pausa consciente";
        }

        // Verificar permisos de notificación
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('🧘 Momento de Atención Plena', {
                body: message,
                icon: '/assets/icons/192x192.png',
                badge: '/assets/icons/48x48.png',
                tag: 'mindfulness-alert',
                requireInteraction: false,
                silent: false,
                vibrate: this.config.vibrationEnabled ? [200, 100, 200] : []
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto-cerrar después de 5 segundos
            setTimeout(() => {
                notification.close();
            }, 5000);
        } else if ('Notification' in window && Notification.permission === 'default') {
            // Solicitar permisos si no se han otorgado
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showBrowserNotification(message);
                }
            });
        }
    }

    async scheduleServerSideAlerts() {
        if (!this.oneSignalManager || !window.OneSignal || !window.OneSignal.User.PushSubscription.optedIn) return;

        try {
            const intervalMinutes = this.config.intervalSeconds / 60;
            const totalDuration = this.config.autoStopEnabled ? 
                this.config.autoStopDuration : 480; // 8 horas por defecto

            // Por ahora solo log - las notificaciones push reales requieren servidor
            console.log(`📅 Programando alertas cada ${intervalMinutes} minutos por ${totalDuration} minutos`);
            this.showToast('OneSignal configurado - las alertas locales funcionan normalmente', 'info');
            
        } catch (error) {
            console.error('Error scheduling server-side alerts:', error);
            this.showToast('Error al programar alertas en el servidor', 'error');
        }
    }

    async cancelServerSideAlerts() {
        if (!this.oneSignalManager || !window.OneSignal || !window.OneSignal.User.PushSubscription.optedIn) return;

        try {
            // Por ahora solo log - la cancelación real requiere servidor
            console.log('📅 Cancelando alertas programadas en servidor');
        } catch (error) {
            console.error('Error cancelling server-side alerts:', error);
        }
    }

    updateOneSignalUI() {
        const pushCheckbox = document.getElementById('push-notifications-enabled');
        const pushStatus = document.getElementById('push-status');
        
        if (this.oneSignalManager && window.OneSignal) {
            try {
                const optedIn = window.OneSignal.User.PushSubscription.optedIn;
                
                if (pushCheckbox) {
                    pushCheckbox.disabled = false;
                    pushCheckbox.checked = optedIn;
                }
                
                if (pushStatus && optedIn) {
                    pushStatus.style.display = 'block';
                    pushStatus.innerHTML = '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Notificaciones habilitadas</span>';
                }
                
                console.log('✅ UI de OneSignal actualizada');
                
            } catch (error) {
                console.error('Error actualizando UI OneSignal:', error);
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mindfulnessAlerts = new MindfulnessAlerts();
});
