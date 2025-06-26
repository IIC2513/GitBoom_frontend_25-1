#!/bin/bash

echo "🧪 Ejecutando pruebas Selenium para REMEAL"
echo "=========================================="

# Verificar que la aplicación esté corriendo
echo "🔍 Verificando que la aplicación esté corriendo..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Aplicación detectada en http://localhost:5173"
else
    echo "❌ Error: La aplicación no está corriendo en http://localhost:5173"
    echo "💡 Ejecuta 'npm run dev' en otra terminal antes de continuar"
    exit 1
fi

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Ejecutar las pruebas
echo "🚀 Iniciando pruebas Selenium..."
npm run test:selenium

echo ""
echo "📊 Pruebas completadas!"
echo "💡 Revisa los resultados arriba para ver si obtuviste el bonus." 