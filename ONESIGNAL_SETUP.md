# Configuración de OneSignal para Alertas de Mindfulness

## Pasos para configurar OneSignal

### 1. Crear cuenta en OneSignal
1. Ve a [onesignal.com](https://onesignal.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación web

### 2. Configurar la aplicación web
1. En el dashboard de OneSignal, ve a "Settings" > "Platforms"
2. Selecciona "Web Push" 
3. Configura:
   - **Site Name**: Camino Medio
   - **Site URL**: https://www.caminomedio.org
   - **Default Icon URL**: https://www.caminomedio.org/assets/img/logocompleto.png
   - **Choose Integration**: Custom Code

### 3. Obtener credenciales
1. Ve a "Settings" > "Keys & IDs"
2. Copia el **App ID** 
3. Copia la **REST API Key** (para backend)

### 4. Configurar archivos
1. Edita `js/onesignal-config.js`:
   ```javascript
   const ONESIGNAL_CONFIG = {
       appId: "TU_APP_ID_AQUI", // Reemplazar con tu App ID real
       // ... resto de configuración
   };
   ```

### 5. Archivos adicionales necesarios
OneSignal requiere estos archivos en la raíz del dominio:

#### `OneSignalSDKWorker.js` (en la raíz del sitio)
```javascript
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');
```

#### `OneSignalSDKUpdaterWorker.js` (en la raíz del sitio)
```javascript  
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');
```

### 6. Configuración de servidor (Backend) - OPCIONAL
Para envío automático de notificaciones, necesitas un backend que:

1. **Reciba configuración de alertas**:
   ```javascript
   POST /api/schedule-mindfulness-alerts
   {
     "userId": "onesignal-player-id",
     "intervalMinutes": 5,
     "totalDuration": 60
   }
   ```

2. **Envíe notificaciones usando OneSignal API**:
   ```javascript
   // Ejemplo con Node.js
   const OneSignal = require('onesignal-node');
   
   const client = new OneSignal.Client('YOUR_APP_ID', 'YOUR_REST_API_KEY');
   
   const notification = {
     contents: { 'en': '🧘‍♀️ Momento de Mindfulness' },
     include_player_ids: ['user-id'],
     data: { type: 'mindfulness-alert' }
   };
   
   client.createNotification(notification);
   ```

### 7. Configuración de HTTPS
OneSignal requiere HTTPS para funcionar. En desarrollo local:
- Usa `ngrok` para túnel HTTPS
- O configura certificados SSL locales

### 8. Configuración de dominio
1. Agrega tu dominio en OneSignal Dashboard
2. Verifica que los service workers estén accesibles
3. Prueba las notificaciones desde OneSignal Dashboard

## Estructura de archivos final

```
/
├── OneSignalSDKWorker.js          # En raíz del dominio
├── OneSignalSDKUpdaterWorker.js   # En raíz del dominio
└── alertas/
    ├── index.html
    ├── js/
    │   ├── onesignal-config.js    # Tu App ID aquí
    │   └── alertas.js
    └── css/
        └── alertas.css
```

## Características implementadas

### ✅ Notificaciones Push
- Funcionan con app cerrada
- Funcionan con teléfono inactivo
- Mensajes personalizados de mindfulness
- Integración con configuración existente

### ✅ Gestión de suscripciones
- Solicitud automática de permisos
- Estado de suscripción en UI
- Activar/desactivar fácilmente

### ✅ Programación de alertas
- Estructura para backend (servidor)
- Intervalos personalizables
- Duración configurable

### ✅ Fallbacks
- Si push no disponible → notificación web
- Si notificación web no disponible → visual
- Múltiples capas de compatibilidad

## Ejemplo de uso

1. Usuario configura intervalo de 5 minutos
2. Activa "Notificaciones Push"
3. Acepta permisos del navegador
4. OneSignal programa las alertas
5. Usuario cierra la app
6. **Sigue recibiendo alertas cada 5 minutos**

## Limitaciones y consideraciones

### Limitaciones técnicas
- Requiere HTTPS en producción
- iOS Safari tiene limitaciones
- Algunas configuraciones de Android pueden limitar notificaciones

### Consideraciones de privacidad
- Los datos se almacenan en OneSignal
- Cumple con GDPR (configurar en OneSignal)
- Usuario puede desactivar en cualquier momento

### Costos
- OneSignal gratuito hasta 30,000 usuarios
- Para más usuarios, planes de pago disponibles

## Soporte y troubleshooting

### Problemas comunes
1. **Service workers no se cargan**: Verificar rutas y HTTPS
2. **Permisos denegados**: Usuario debe aceptar manualmente
3. **Notificaciones no llegan**: Verificar configuración de OneSignal

### Debug
- Consola del navegador para errores
- OneSignal Dashboard para estadísticas
- Herramientas de desarrollador para service workers

---

Una vez configurado correctamente, las alertas de mindfulness funcionarán perfectamente aunque el dispositivo esté inactivo o la app cerrada. 🧘‍♀️
