# 🔔 Guía de Solución de Problemas - Notificaciones Push

## ¿Por qué no aparecen las notificaciones push en mi teléfono?

### 🔍 **Diagnóstico Paso a Paso**

#### 1. **Verificar Estado en la App**
- ✅ Activa las notificaciones push en la configuración
- 🔘 Usa el botón "**Verificar Estado**" para ver información técnica
- 🧪 Usa el botón "**Probar Notificación**" para enviar una de prueba

#### 2. **Requisitos del Navegador**

**Android:**
- ✅ Chrome, Firefox, Edge (versiones recientes)
- ✅ Samsung Internet, Opera
- ❌ Navegadores antiguos o no estándar

**iOS (iPhone/iPad):**
- ✅ Safari 16.4+ (iOS 16.4+)
- ✅ Chrome, Firefox (solo desde iOS 16.4+)
- ❌ Versiones anteriores de iOS

#### 3. **Configuración del Dispositivo**

**Android:**
1. **Ajustes del navegador:**
   - Ve a Ajustes → Apps → [Tu navegador] → Notificaciones
   - Asegúrate de que estén habilitadas
   
2. **Ajustes del sitio:**
   - En el navegador, ve a Configuración → Sitios web → Notificaciones
   - Busca "alertas.caminomedio.org" y permite notificaciones

3. **Modo ahorro de batería:**
   - Desactiva optimización de batería para tu navegador
   - Ve a Ajustes → Batería → Optimización de batería

**iOS:**
1. **Configuración de Safari:**
   - Ajustes → Safari → Sitios web → Notificaciones push
   - Permite para "alertas.caminomedio.org"

2. **Configuración general:**
   - Ajustes → Notificaciones → Safari
   - Asegúrate de que estén habilitadas

#### 4. **Problemas Comunes y Soluciones**

| Problema | Posible Causa | Solución |
|----------|---------------|----------|
| **"Verificar Estado" muestra ID: No disponible** | OneSignal no se registró correctamente | Recarga la página, reactive notificaciones |
| **"Probar Notificación" no llega** | Permisos del navegador | Revisa configuración del navegador |
| **Funciona en escritorio, no en móvil** | Configuración específica del dispositivo | Revisa ajustes del teléfono |
| **No funciona en ningún lugar** | Problema de conectividad | Verifica conexión a internet |

#### 5. **Método de Prueba Infalible**

1. **Activa notificaciones** en la app
2. **Presiona "Probar Notificación"** - debería aparecer inmediatamente
3. **Si funciona la prueba:** El problema está en la configuración de alertas automáticas
4. **Si no funciona la prueba:** El problema está en permisos o configuración del dispositivo

#### 6. **Verificación Técnica**

Usa el botón "**Verificar Estado**" y revisa:

- ✅ **Permiso: granted** ← Debe estar en "granted"
- ✅ **Suscrito: Sí** ← Debe estar en "Sí"
- ✅ **ID: [valor]** ← Debe tener un ID válido (no "No disponible")
- ✅ **Token: Presente** ← Debe estar presente
- ✅ **HTTPS: Sí** ← Debe estar en "Sí"

#### 7. **Qué Hacer Si Sigue Sin Funcionar**

1. **Cierra completamente el navegador** y vuelve a abrirlo
2. **Borra la caché** del sitio web
3. **Desactiva y reactiva** las notificaciones en la app
4. **Prueba en modo incógnito/privado**
5. **Actualiza el navegador** a la última versión
6. **Reinicia el dispositivo**

### 🧪 **Modo de Prueba Avanzado**

Si eres técnico, puedes:

1. **Abrir DevTools** (F12 en escritorio)
2. **Ir a Console** y ejecutar:
   ```javascript
   debugOneSignal()
   ```
3. **Revisar errores** en la consola
4. **Verificar Service Worker** en la pestaña Application

### 📱 **Diferencias iOS vs Android**

| Característica | Android | iOS |
|----------------|---------|-----|
| **Soporte** | ✅ Excelente | ✅ Desde iOS 16.4+ |
| **Navegadores soportados** | Chrome, Firefox, Edge, etc. | Safari, Chrome (limitado) |
| **Configuración** | Más flexible | Más restrictiva |
| **Modo background** | ✅ Funciona bien | ⚠️ Limitaciones |

### 🔧 **Para Desarrolladores**

Si necesitas depurar más profundamente:
- Revisa la **Console del navegador** para errores
- Verifica que **Service Worker** esté registrado
- Confirma que **OneSignal SDK** se carga correctamente
- Comprueba **permisos de notificación** del navegador

---

**💡 Consejo:** Las notificaciones push funcionan mejor cuando la app está **agregada a la pantalla de inicio** como PWA (Progressive Web App).
