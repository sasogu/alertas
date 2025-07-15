# CaminoMedio Alertas 🧘

Sistema de notificaciones push para prácticas de mindfulness y meditación.

## 🌟 Características

- ✅ Integración completa con OneSignal SDK v16
- ✅ Interfaz profesional de testing
- ✅ Service Workers optimizados
- ✅ Configuración PWA
- ✅ Sistema de configuración multi-entorno
- ✅ Debugging avanzado

## 🚀 Despliegue

### Dominio objetivo
```
https://alertas.caminomedio.org/
```

### Configuración OneSignal requerida
1. Crear nueva app en OneSignal para el dominio `alertas.caminomedio.org`
2. Configurar las credenciales en `js/env-config.js` o variables de entorno
3. Actualizar los service workers con el nuevo App ID

## 📁 Estructura del proyecto

```
alertas/
├── index.html              # Página principal
├── test-onesignal.html     # Interfaz de testing profesional
├── manifest.json           # PWA manifest
├── package.json            # Dependencias Node.js
├── config-server.js        # Servidor de configuración
├── css/
│   └── alertas.css         # Estilos personalizados
├── js/
│   ├── env-config.js       # Configuración multi-entorno
│   ├── simple-config.js    # Configuración simplificada
│   ├── onesignal-config.js # Configuración OneSignal
│   ├── alertas.js          # Lógica principal
│   └── OneSignalSDK.js     # SDK local fallback
├── sounds/                 # Sonidos de notificación
├── OneSignalSDK*.js        # Service Workers OneSignal
└── .env.example           # Ejemplo de variables de entorno
```

## 🔧 Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales OneSignal
```

### 3. Ejecutar en desarrollo
```bash
# Servidor de configuración (puerto 3000)
npm run dev

# Servidor estático HTTPS (puerto 8081)
npm run serve
```

### 4. Configurar OneSignal
1. Crear nueva app en [OneSignal](https://onesignal.com)
2. Configurar dominio: `https://alertas.caminomedio.org`
3. Actualizar credenciales en `js/env-config.js` o `.env`

## 🔐 Configuración

### Variables de entorno (.env)
```env
ONESIGNAL_APP_ID=tu_app_id_aqui
ONESIGNAL_SAFARI_WEB_ID=web.onesignal.auto.tu_safari_id
PORT=3000
```

### Configuración local (js/env-config.js)
```javascript
ONESIGNAL_APP_ID: 'tu_app_id_aqui',
ONESIGNAL_SAFARI_WEB_ID: 'web.onesignal.auto.tu_safari_id'
```

## 🧪 Testing

Accede a `test-onesignal.html` para:
- ✅ Verificar configuración OneSignal
- ✅ Probar solicitud de permisos
- ✅ Enviar notificaciones de prueba
- ✅ Debugging avanzado
- ✅ Verificar service workers

## 🌐 Despliegue en producción

### Opción 1: Servidor estático
1. Subir archivos a `https://alertas.caminomedio.org/`
2. Configurar HTTPS (requerido por OneSignal)
3. Actualizar DNS si es necesario

### Opción 2: Con servidor Node.js
1. Ejecutar `npm start` en el servidor
2. Configurar proxy reverso (nginx/apache)
3. Configurar certificado SSL

## 📱 PWA Features

- ✅ Manifest configurado
- ✅ Service Workers
- ✅ Instalable en dispositivos móviles
- ✅ Notificaciones push
- ✅ Trabajo offline básico

## 🔍 Debugging

El proyecto incluye herramientas de debugging avanzadas:
- Console logs detallados
- Verificación de service workers
- Testing de configuración
- Monitoreo de estado OneSignal

## 📞 Soporte

Para issues o preguntas sobre la configuración de OneSignal, consulta:
- [Documentación OneSignal](https://documentation.onesignal.com/docs/web-push-quickstart)
- Archivo `ONESIGNAL_SETUP.md` incluido en el proyecto

---

**CaminoMedio Alertas** - Sistema de notificaciones para la práctica del mindfulness 🧘‍♂️
