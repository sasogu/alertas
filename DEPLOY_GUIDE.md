# 🚀 Deployment Guide - CaminoMedio Alertas

## 📋 **Pre-Deploy Checklist**

### ✅ **Archivos Verificados**
- [x] `index.html` - Página principal
- [x] `js/alertas.js` - Lógica principal  
- [x] `js/onesignal-working.js` - OneSignal funcional
- [x] `css/alertas.css` - Estilos
- [x] `manifest.json` - PWA config
- [x] `sw.js` - Service Worker
- [x] `assets/icons/` - Iconos PWA
- [x] `sounds/` - Archivos de audio

### ✅ **Configuración OneSignal**
- [x] App ID: `75f7bf03-ba86-4059-99cc-797fe53a147d`
- [x] Safari Web ID configurado
- [x] SDK v16 funcionando
- [x] Test exitoso confirmado

## 🌐 **Deploy a Producción**

### **Opción 1: Netlify (Recomendado)**
```bash
# 1. Preparar archivos
cp -r /home/sasogu/web/alertas ./alertas-deploy
cd alertas-deploy

# 2. Limpiar archivos de desarrollo
rm -rf test-*.html
rm -rf backend-example.js
rm -rf config-server.js
rm -rf cert.pem key.pem
rm -rf node_modules

# 3. Crear _redirects para SPA
echo "/*    /index.html   200" > _redirects

# 4. Deploy
# - Subir carpeta a Netlify
# - Configurar dominio personalizado
# - Habilitar HTTPS (automático)
```

### **Opción 2: Vercel**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
cd /home/sasogu/web/alertas
vercel --prod
```

### **Opción 3: GitHub Pages**
```bash
# 1. Crear repositorio
git init
git add .
git commit -m "CaminoMedio Alertas - Production Ready"

# 2. Push a GitHub
git remote add origin https://github.com/usuario/caminomedio-alertas
git push -u origin main

# 3. Habilitar GitHub Pages en configuración del repo
```

## 🔧 **Configuración Post-Deploy**

### **1. Verificar HTTPS**
- ✅ OneSignal requiere HTTPS
- ✅ PWA requiere HTTPS
- ✅ Notificaciones requieren HTTPS

### **2. Configurar Dominio**
- Actualizar variables en `js/env-config.js` si es necesario
- Verificar URLs en `manifest.json`
- Actualizar meta tags de OneSignal si cambia el dominio

### **3. Test de Funcionalidades**
```
✅ PWA instalable
✅ OneSignal inicializa
✅ Notificaciones funcionan
✅ Sonidos reproducen
✅ Configuración persiste
✅ Responsive design
```

## 📱 **PWA Installation**

### **Chrome/Edge (Desktop)**
1. Visitar la URL
2. Click en ícono de instalación en barra de direcciones
3. Confirmar instalación

### **Chrome (Android)**
1. Visitar la URL
2. Menú → "Agregar a pantalla de inicio"
3. Confirmar instalación

### **Safari (iOS)**
1. Visitar la URL
2. Botón compartir
3. "Agregar a pantalla de inicio"

## 🔔 **OneSignal Backend (Opcional)**

### **Para Notificaciones Push Reales**
```javascript
// backend/server.js
const OneSignal = require('@onesignal/node-onesignal');

const client = new OneSignal.DefaultApi(
    OneSignal.createConfiguration({
        userKey: 'YOUR_USER_KEY',
        appKey: 'YOUR_APP_KEY'
    })
);

// Enviar notificación
app.post('/api/send-alert', async (req, res) => {
    const notification = new OneSignal.Notification();
    notification.app_id = '75f7bf03-ba86-4059-99cc-797fe53a147d';
    notification.contents = { en: req.body.message };
    notification.included_segments = ['Subscribed Users'];
    
    await client.createNotification(notification);
    res.json({ success: true });
});
```

## 📊 **Analytics (Opcional)**

### **Google Analytics 4**
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### **Métricas a Trackear**
- Instalaciones PWA
- Suscripciones OneSignal
- Sesiones de alertas iniciadas
- Tiempo promedio de sesión
- Configuraciones guardadas

## 🔒 **Seguridad**

### **Headers de Seguridad**
```
# _headers (Netlify)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' cdn.onesignal.com *.fontawesome.com *.jsdelivr.net *.gstatic.com;
               style-src 'self' 'unsafe-inline' *.jsdelivr.net fonts.googleapis.com;
               font-src fonts.gstatic.com;
               img-src 'self' data:;
               connect-src 'self' onesignal.com *.onesignal.com;">
```

## 🚀 **Performance**

### **Optimizaciones Aplicadas**
- ✅ Lazy loading de imágenes
- ✅ CDN para Bootstrap/FontAwesome
- ✅ Compresión de assets
- ✅ Service Worker para caché
- ✅ Manifest optimizado

### **Lighthouse Score Esperado**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: 100

## 🎯 **URLs Finales**

### **Producción**
- Principal: `https://tu-dominio.com/`
- PWA: Instalable desde cualquier navegador
- OneSignal: Funcionando automáticamente

### **Backup/Testing**
- `https://alertas.caminomedio.org/` (desarrollo)
- `https://alertas.caminomedio.org/test-oficial.html` (OneSignal test)

---

## ✅ **Deploy Checklist Final**

- [ ] Archivos subidos a hosting
- [ ] HTTPS habilitado
- [ ] PWA instalable
- [ ] OneSignal funcionando
- [ ] Todas las funciones probadas
- [ ] Analytics configurado (opcional)
- [ ] Dominio configurado
- [ ] Performance optimizada

**🎉 ¡Listo para producción!**

---

*CaminoMedio Alertas - Mindfulness App - 2025*
