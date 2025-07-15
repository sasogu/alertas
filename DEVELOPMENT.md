# 🚀 Guía de Desarrollo Rápido - CaminoMedio Alertas

## ⚡ Inicio Rápido

### 1. Configuración inicial
```bash
./setup.sh
```

### 2. Configurar credenciales OneSignal
Edita el archivo `.env` con tus credenciales:
```env
ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_SAFARI_WEB_ID=tu-safari-web-id-aqui
ONESIGNAL_REST_API_KEY=tu-rest-api-key-aqui
```

### 3. Iniciar desarrollo
```bash
./dev-start.sh
```

O usando VS Code:
- `Ctrl+Shift+P` → "Tasks: Run Task" → "Iniciar desarrollo completo"

## 🌐 URLs de desarrollo

- **Servidor de configuración**: http://localhost:3001
- **Aplicación principal**: http://localhost:8081
- **Interfaz de testing**: http://localhost:8081/test-onesignal.html
- **API de configuración**: http://localhost:3001/api/config

## 🔧 Tareas disponibles en VS Code

- **Setup inicial**: Configuración automática del proyecto
- **Instalar dependencias**: `npm install`
- **Iniciar desarrollo completo**: Inicia todos los servicios necesarios
- **Servidor de configuración (dev)**: Solo el servidor Node.js con nodemon
- **Servidor estático (Python)**: Solo el servidor de archivos estáticos
- **Abrir interfaz de testing**: Abre directamente la página de testing

## 📁 Archivos importantes

- `index.html` - Página principal de la aplicación
- `test-onesignal.html` - Interfaz completa de testing
- `config-server.js` - Servidor para servir credenciales de OneSignal
- `js/env-config.js` - Configuración multi-entorno
- `js/alertas.js` - Lógica principal de la aplicación
- `.env` - Variables de entorno (crear desde .env.example)

## 🧪 Testing

1. Abre http://localhost:8081/test-onesignal.html
2. Verifica que las credenciales se carguen correctamente
3. Prueba la inicialización de OneSignal
4. Prueba suscripciones y notificaciones

## 🚀 Despliegue

El proyecto está configurado para desplegarse en:
```
https://alertas.caminomedio.org/
```

### Preparación para producción:
1. Configurar dominio en OneSignal
2. Actualizar variables de entorno para producción
3. Configurar HTTPS en el servidor
4. Verificar service workers

## 🔍 Debugging

- Usa las DevTools del navegador
- Verifica la consola para logs de OneSignal
- Comprueba Application → Service Workers
- Revisa Application → Storage para datos de OneSignal

## 📝 Comandos útiles

```bash
# Ver logs del servidor
npm run dev

# Limpiar instalación
rm -rf node_modules && npm install

# Verificar configuración
curl http://localhost:3001/api/config

# Ver puertos en uso
netstat -tlnp | grep :3001
netstat -tlnp | grep :8081
```
