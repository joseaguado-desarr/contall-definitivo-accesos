#!/bin/bash
# Script de inicio rápido - Copiar este contenido y ejecutar

echo "🚀 Iniciando aplicación Access Control Hub..."
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ No se encontró package.json. Por favor ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Instalación de dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del cliente..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Instalando dependencias del servidor..."
    npm --prefix server install
fi

echo ""
echo "✅ Dependencias instaladas"
echo ""
echo "🔍 Verificando base de datos..."
node server/verify-db.js

echo ""
echo "✅ Iniciando aplicación..."
echo ""
echo "Cliente disponible en:  http://localhost:5173"
echo "Servidor disponible en: http://localhost:8081"
echo ""

npm run dev
