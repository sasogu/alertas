/**
 * Backend de ejemplo para Alertas de Mindfulness con OneSignal
 * Ejemplo en Node.js + Express
 */

const express = require('express');
const OneSignal = require('onesignal-node');
const cron = require('node-cron');

const app = express();
app.use(express.json());

// Configuración de OneSignal
const ONESIGNAL_CONFIG = {
    appId: process.env.ONESIGNAL_APP_ID,
    restApiKey: process.env.ONESIGNAL_REST_API_KEY
};

const client = new OneSignal.Client(ONESIGNAL_CONFIG.appId, ONESIGNAL_CONFIG.restApiKey);

// Almacén temporal de sesiones activas (en producción usar base de datos)
const activeSessions = new Map();
const scheduledJobs = new Map();

// Mensajes de mindfulness
const MINDFULNESS_MESSAGES = [
    "🧘‍♀️ Momento de respirar conscientemente",
    "🌸 Pausa y observa el momento presente", 
    "🍃 Toma tres respiraciones profundas",
    "💫 Conecta contigo misma",
    "🌊 Fluye con la tranquilidad del ahora",
    "🕯️ Aquí y ahora",
    "🦋 Suelta y permite que la paz llegue",
    "🌅 Abraza este momento",
    "🎋 Encuentra quietud en el movimiento",
    "🌙 Observa lo que surge sin aferrarte"
];

/**
 * Programar alertas de mindfulness
 */
app.post('/api/schedule-mindfulness-alerts', async (req, res) => {
    try {
        const { userId, intervalMinutes, totalDuration, startTime } = req.body;
        
        if (!userId || !intervalMinutes) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Cancelar sesión anterior si existe
        if (scheduledJobs.has(userId)) {
            scheduledJobs.get(userId).destroy();
        }

        // Configurar nueva sesión
        const session = {
            userId,
            intervalMinutes,
            totalDuration,
            startTime: startTime || Date.now(),
            alertsSent: 0,
            isActive: true
        };

        activeSessions.set(userId, session);

        // Crear tarea programada
        const cronExpression = `*/${intervalMinutes} * * * *`; // Cada X minutos
        
        const job = cron.schedule(cronExpression, async () => {
            await sendMindfulnessAlert(userId);
        }, {
            scheduled: true,
            timezone: "Europe/Madrid" // Ajustar según zona horaria
        });

        scheduledJobs.set(userId, job);

        // Auto-cancelar después de la duración total
        if (totalDuration && totalDuration > 0) {
            setTimeout(() => {
                cancelUserAlerts(userId);
            }, totalDuration * 60 * 1000); // Convertir a millisegundos
        }

        res.json({ 
            success: true, 
            message: 'Alertas programadas correctamente',
            session: {
                userId,
                intervalMinutes,
                totalDuration,
                nextAlert: new Date(Date.now() + intervalMinutes * 60 * 1000)
            }
        });

    } catch (error) {
        console.error('Error scheduling alerts:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * Cancelar alertas programadas
 */
app.post('/api/cancel-mindfulness-alerts', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const cancelled = cancelUserAlerts(userId);

        res.json({ 
            success: true, 
            message: cancelled ? 'Alertas canceladas' : 'No había alertas activas'
        });

    } catch (error) {
        console.error('Error cancelling alerts:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * Obtener estado de sesión
 */
app.get('/api/session-status/:userId', (req, res) => {
    const { userId } = req.params;
    const session = activeSessions.get(userId);

    if (!session) {
        return res.json({ active: false });
    }

    res.json({
        active: session.isActive,
        alertsSent: session.alertsSent,
        startTime: session.startTime,
        intervalMinutes: session.intervalMinutes,
        totalDuration: session.totalDuration,
        nextAlert: new Date(Date.now() + session.intervalMinutes * 60 * 1000)
    });
});

/**
 * Enviar alerta de mindfulness
 */
async function sendMindfulnessAlert(userId) {
    try {
        const session = activeSessions.get(userId);
        
        if (!session || !session.isActive) {
            console.log(`Session not active for user ${userId}`);
            return;
        }

        // Seleccionar mensaje aleatorio
        const message = MINDFULNESS_MESSAGES[
            Math.floor(Math.random() * MINDFULNESS_MESSAGES.length)
        ];

        // Crear notificación
        const notification = {
            app_id: ONESIGNAL_CONFIG.appId,
            include_player_ids: [userId],
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
                timestamp: Date.now(),
                sessionId: userId
            },
            large_icon: "https://www.caminomedio.org/assets/img/logocompleto.png",
            small_icon: "https://www.caminomedio.org/assets/img/logopeque.png",
            android_sound: "notification",
            ios_sound: "notification.wav",
            web_buttons: [
                {
                    id: "open-app",
                    text: "Abrir App",
                    url: "https://www.caminomedio.org/alertas/"
                },
                {
                    id: "pause-alerts", 
                    text: "Pausar",
                    url: "https://www.caminomedio.org/alertas/?action=pause"
                }
            ],
            // Configuración adicional
            android_channel_id: "mindfulness-alerts",
            existing_android_channel_id: "mindfulness-alerts",
            priority: 6, // Alta prioridad
            ttl: 3600 // 1 hora de tiempo de vida
        };

        // Enviar notificación
        const response = await client.createNotification(notification);
        
        // Actualizar estadísticas de sesión
        session.alertsSent++;
        
        console.log(`Mindfulness alert sent to ${userId}:`, {
            notificationId: response.body.id,
            message: message,
            alertsSent: session.alertsSent
        });

        // Verificar límites de auto-stop
        if (session.totalDuration && session.alertsSent >= session.totalDuration) {
            console.log(`Session limit reached for ${userId}, stopping alerts`);
            cancelUserAlerts(userId);
        }

    } catch (error) {
        console.error('Error sending mindfulness alert:', error);
    }
}

/**
 * Cancelar alertas de un usuario
 */
function cancelUserAlerts(userId) {
    const job = scheduledJobs.get(userId);
    const session = activeSessions.get(userId);

    if (job) {
        job.destroy();
        scheduledJobs.delete(userId);
    }

    if (session) {
        session.isActive = false;
        activeSessions.delete(userId);
        return true;
    }

    return false;
}

/**
 * Limpiar sesiones expiradas (ejecutar cada hora)
 */
cron.schedule('0 * * * *', () => {
    const now = Date.now();
    const expiredSessions = [];

    for (const [userId, session] of activeSessions.entries()) {
        const sessionAge = now - session.startTime;
        const maxAge = (session.totalDuration || 480) * 60 * 1000; // Por defecto 8 horas

        if (sessionAge > maxAge) {
            expiredSessions.push(userId);
        }
    }

    expiredSessions.forEach(userId => {
        console.log(`Cleaning expired session for user ${userId}`);
        cancelUserAlerts(userId);
    });

    console.log(`Cleaned ${expiredSessions.length} expired sessions`);
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        activeSessions: activeSessions.size,
        scheduledJobs: scheduledJobs.size,
        uptime: process.uptime()
    });
});

/**
 * Webhook para manejar eventos de OneSignal (opcional)
 */
app.post('/api/onesignal-webhook', (req, res) => {
    const { event, data } = req.body;

    switch (event) {
        case 'notification.clicked':
            console.log('Notification clicked:', data);
            // Manejar clic en notificación
            break;
        
        case 'session.duration':
            console.log('Session duration:', data);
            // Manejar datos de sesión
            break;
        
        default:
            console.log('Unknown event:', event);
    }

    res.json({ received: true });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mindfulness Alerts Backend running on port ${PORT}`);
    console.log(`Active sessions: ${activeSessions.size}`);
    console.log(`Scheduled jobs: ${scheduledJobs.size}`);
});

module.exports = app;
