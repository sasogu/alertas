# 🛠️ Extensiones Recomendadas para VS Code

Este proyecto incluye configuración para las siguientes extensiones de VS Code que mejorarán tu experiencia de desarrollo:

## 📦 Extensiones Principales

### Desarrollo Web
- **Live Server** (`ritwickdey.liveserver`) - Servidor local con auto-reload
- **HTML CSS Support** (`ms-vscode.vscode-html-css-support`) - Soporte mejorado para HTML/CSS
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`) - Renombra automáticamente etiquetas HTML
- **Path Intellisense** (`christian-kohler.path-intellisense`) - Autocompletado de rutas de archivos

### JavaScript/Node.js
- **TypeScript** (`ms-vscode.vscode-typescript-next`) - Soporte completo para TypeScript
- **Node.js Debugger** (`ms-vscode.vscode-node-debug2`) - Debugging para Node.js

### Utilidades
- **Prettier** (`esbenp.prettier-vscode`) - Formateador de código
- **JSON** (`ms-vscode.vscode-json`) - Soporte mejorado para JSON
- **REST Client** (`humao.rest-client`) - Cliente HTTP para testing de APIs

### Styling (Opcional)
- **Tailwind CSS** (`bradlc.vscode-tailwindcss`) - Soporte para Tailwind CSS

## 🚀 Instalación Automática

VS Code debería sugerirte automáticamente instalar estas extensiones cuando abras el workspace. Si no es así:

1. `Ctrl+Shift+P`
2. Escribe "Extensions: Show Recommended Extensions"
3. Instala las extensiones sugeridas

## ⚙️ Configuración Incluida

El workspace ya incluye configuración optimizada en `.vscode/settings.json`:

- Formateo automático al guardar
- Autoguardado activado
- Configuración de Live Server
- Tabulación y espacios consistentes
- Asociaciones de archivos optimizadas

## 🔧 Configuración Manual

Si prefieres instalar las extensiones manualmente:

```bash
# Instalar todas las extensiones recomendadas
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.live-server
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-html-css-support
code --install-extension ritwickdey.liveserver
code --install-extension humao.rest-client
code --install-extension ms-vscode.vscode-node-debug2
```

## 🎯 Uso Específico para el Proyecto

### Live Server
- Clic derecho en `index.html` o `test-onesignal.html` → "Open with Live Server"
- O usa `Ctrl+Shift+P` → "Live Server: Open with Live Server"

### REST Client
- Crear archivos `.http` para probar el endpoint `/api/config`
- Ejemplo en `tests/api.http`

### Debugging
- Usar la configuración de launch incluida para debuggear `config-server.js`
- Configuración ya lista en `.vscode/launch.json`
