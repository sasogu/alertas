#!/bin/bash

# Setup script for CaminoMedio Alertas
# Script de configuración para CaminoMedio Alertas

echo "🚀 Configurando CaminoMedio Alertas..."

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de OneSignal"
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

# Verificar que Python3 esté disponible
if command -v python3 &> /dev/null; then
    echo "✅ Python3 detectado"
else
    echo "❌ Python3 no encontrado. Se necesita para servir archivos estáticos."
fi

# Verificar que Node.js esté disponible
if command -v node &> /dev/null; then
    echo "✅ Node.js detectado: $(node --version)"
else
    echo "❌ Node.js no encontrado. Se necesita para el servidor de configuración."
fi

echo ""
echo "🎯 Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita .env con tus credenciales de OneSignal"
echo "2. Ejecuta 'npm run dev' para desarrollo"
echo "3. Ejecuta 'npm run serve' para servir archivos estáticos"
echo "4. Visita http://localhost:8081/test-onesignal.html para testing"
echo ""
echo "🌐 Dominio objetivo: https://alertas.caminomedio.org/"
echo ""
