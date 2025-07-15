# 🔐 Sistema de Credenciales OneSignal

## 📋 Resumen del Sistema

Tu aplicación tiene un **sistema en cascada** para cargar credenciales de OneSignal, con múltiples fallbacks:

```
1. Servidor dinámico (/api/config)     ← Ideal para servidores Node.js
   ↓ (si falla)
2. Archivo JSON estático (/api/config.json)  ← Para hosting estático
   ↓ (si falla)  
3. Meta tags HTML                     ← Respaldo en HTML
   ↓ (si falla)
4. Credenciales hardcodeadas          ← Último recurso
```

## 🌐 Para Servidor Estático (tu caso)

### ✅ Opción 1: Archivo JSON estático (Recomendado)
Sube el archivo `api/config.json` a tu servidor:
```json
{
    "ONESIGNAL_APP_ID": "75f7bf03-ba86-4059-99cc-797fe53a147d",
    "ONESIGNAL_SAFARI_WEB_ID": "web.onesignal.auto.3f550615-46c0-4fa5-9ee8-42953ece3d19"
}
```

### ✅ Opción 2: Meta tags HTML
Las credenciales están en las meta tags de `index.html` y `test-onesignal.html`:
```html
<meta name="onesignal-app-id" content="75f7bf03-ba86-4059-99cc-797fe53a147d" />
<meta name="onesignal-safari-id" content="web.onesignal.auto.3f550615-46c0-4fa5-9ee8-42953ece3d19" />
```

### ✅ Opción 3: Hardcodeadas (Funciona siempre)
Como último fallback, están hardcodeadas en `env-config.js`

## 🚀 Para Despliegue

### Archivos que debes subir a tu servidor estático:
```
alertas.caminomedio.org/
├── index.html                    ← Credenciales en meta tags
├── test-onesignal.html          ← Credenciales en meta tags  
├── js/env-config.js             ← Sistema de carga
├── api/config.json              ← Credenciales JSON (opcional)
├── OneSignalSDKWorker.js        ← Service Worker OneSignal
├── OneSignalSDKUpdaterWorker.js ← Service Worker OneSignal
└── ... (resto de archivos)
```

## 🔍 Verificación

1. **Abre la consola del navegador** en tu sitio desplegado
2. **Busca estos logs**:
   ```
   🔌 Intentando cargar configuración desde servidor...
   ✅ Configuración cargada desde servidor
   🎯 EnvConfig inicializado para alertas.caminomedio.org
   ```

3. **Si ves estos logs, todo funciona**:
   ```
   🔧 Usando configuración local para desarrollo
   💡 App ID configurado: 75f7bf03-ba86-4059-99cc-797fe53a147d
   ```

## ⚠️ Importante

- **Las credenciales APP_ID y SAFARI_WEB_ID son públicas** - es seguro exponerlas
- **NUNCA expongas REST_API_KEY** - esa es solo para backend
- **OneSignal requiere HTTPS** - no funcionará con HTTP en producción

## 🧪 Testing

Usa la página de testing: `https://alertas.caminomedio.org/test-onesignal.html`

Deberías ver:
- ✅ Configuración válida
- ✅ OneSignal inicializado correctamente
- ✅ Permisos de notificación funcionando
