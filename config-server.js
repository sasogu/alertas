/**
 * Simple Configuration Server for OneSignal Credentials
 * Servidor simple para servir credenciales de OneSignal de forma segura
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (opcional)
app.use(express.static(path.join(__dirname)));

// Endpoint para servir configuración de OneSignal (solo credenciales públicas)
app.get('/api/config', (req, res) => {
    // Solo exponer credenciales que son seguras para el frontend
    const config = {
        ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
        ONESIGNAL_SAFARI_WEB_ID: process.env.ONESIGNAL_SAFARI_WEB_ID
        // NUNCA exponer ONESIGNAL_REST_API_KEY aquí - es solo para backend
    };

    // Verificar que las credenciales estén configuradas
    if (!config.ONESIGNAL_APP_ID || config.ONESIGNAL_APP_ID === 'your_app_id_here') {
        return res.status(500).json({
            error: 'OneSignal credentials not properly configured',
            message: 'Please check your .env file'
        });
    }

    res.json(config);
});

// Endpoint para enviar notificaciones (usa REST API Key)
app.post('/api/send-notification', async (req, res) => {
    const { message, userIds } = req.body;

    if (!process.env.ONESIGNAL_REST_API_KEY) {
        return res.status(500).json({
            error: 'OneSignal REST API Key not configured'
        });
    }

    try {
        const notificationData = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: userIds,
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
            small_icon: "https://www.caminomedio.org/assets/img/logopeque.png"
        };

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify(notificationData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.errors ? result.errors.join(', ') : 'Failed to send notification');
        }

        res.json({
            success: true,
            notification_id: result.id,
            recipients: result.recipients
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            error: 'Failed to send notification',
            message: error.message
        });
    }
});

// Endpoint para programar notificaciones periódicas
app.post('/api/schedule-alerts', async (req, res) => {
    const { userId, intervalMinutes, totalDuration } = req.body;

    // Aquí implementarías la lógica para programar notificaciones
    // Puedes usar cron jobs, setTimeout, o una cola de trabajos
    
    console.log('Scheduling alerts:', { userId, intervalMinutes, totalDuration });
    
    // Por simplicidad, solo logueamos - implementar según necesidades
    res.json({
        success: true,
        message: `Alerts scheduled every ${intervalMinutes} minutes for ${totalDuration} duration`,
        userId
    });
});

// Endpoint para cancelar alertas programadas
app.post('/api/cancel-alerts', async (req, res) => {
    const { userId } = req.body;
    
    console.log('Canceling alerts for user:', userId);
    
    res.json({
        success: true,
        message: 'Alerts canceled',
        userId
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Configuration server running on port ${PORT}`);
    console.log(`📍 API endpoints available at:`);
    console.log(`   - GET  /api/config (OneSignal configuration)`);
    console.log(`   - POST /api/send-notification (Send push notifications)`);
    console.log(`   - POST /api/schedule-alerts (Schedule periodic alerts)`);
    console.log(`   - GET  /health (Health check)`);
    
    // Verificar configuración al inicio
    if (!process.env.ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID === 'your_app_id_here') {
        console.warn('⚠️  OneSignal credentials not configured properly!');
        console.warn('   Please check your .env file');
    } else {
        console.log('✅ OneSignal credentials configured');
    }
});

module.exports = app;
