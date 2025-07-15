#!/bin/bash

# Development start script
# Script para iniciar el entorno de desarrollo

echo "🔧 Iniciando entorno de desarrollo CaminoMedio Alertas..."

# Función para manejar la interrupción
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    pkill -f "config-server.js"
    pkill -f "python3 -m http.server"
    exit 0
}

# Capturar señales de interrupción
trap cleanup SIGINT SIGTERM

# Verificar que exista .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado. Ejecuta './setup.sh' primero."
    exit 1
fi

# Iniciar servidor de configuración en background
echo "🚀 Iniciando servidor de configuración (puerto 3001)..."
npm run dev &
CONFIG_PID=$!

# Esperar un momento para que el servidor inicie
sleep 2

# Iniciar servidor estático en background
echo "🌐 Iniciando servidor estático (puerto 8081)..."
npm run serve &
STATIC_PID=$!

echo ""
echo "✅ Servicios iniciados:"
echo "   • Servidor de configuración: http://localhost:3001"
echo "   • Servidor estático: http://localhost:8081"
echo "   • Interfaz de testing: http://localhost:8081/test-onesignal.html"
echo ""
echo "🔍 Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener el script ejecutándose
wait
