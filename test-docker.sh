#!/bin/bash
# =====================================
# Script para verificar Docker localmente
# =====================================

set -e

echo "🔍 Verificando configuración Docker..."

# Verificar archivos necesarios
echo "📁 Verificando archivos del proyecto:"
[ -f "Dockerfile" ] && echo "✅ Dockerfile" || echo "❌ Dockerfile faltante"
[ -f "docker-compose.yml" ] && echo "✅ docker-compose.yml" || echo "❌ docker-compose.yml faltante"
[ -f ".env.production" ] && echo "✅ .env.production" || echo "❌ .env.production faltante"
[ -f "start.sh" ] && echo "✅ start.sh" || echo "❌ start.sh faltante"

# Verificar que start.sh es ejecutable
if [ -f "start.sh" ]; then
    chmod +x start.sh
    echo "✅ start.sh es ejecutable"
fi

# Verificar estructura local (referencia)
echo ""
echo "📊 Estructura local actual:"
echo "Build local:"
yarn build > /dev/null 2>&1
echo "Archivos en dist/:"
ls -la dist/ | head -10
echo "Ubicación de main.js:"
find dist/ -name "main.js" -type f

# Test de build Docker
echo ""
echo "🐳 Probando build de Docker..."
docker-compose build agendoo-api

# Test de inicio sin servicios externos
echo ""
echo "🧪 Probando inicio de contenedor (solo verificación)..."
echo "Creando contenedor temporal para verificar archivos..."

# Crear contenedor temporal para inspeccionar
CONTAINER_ID=$(docker run -d --rm \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_USERNAME=test \
  -e DB_PASSWORD=test \
  -e DB_NAME=test \
  -e RUN_MIGRATIONS=false \
  agendoo_agendoo-api:latest \
  sleep 30)

echo "📦 Contenedor creado: $CONTAINER_ID"

# Verificar estructura dentro del contenedor
echo "📁 Estructura dentro del contenedor:"
docker exec $CONTAINER_ID ls -la /app/dist/ || echo "❌ Error accediendo a dist/"

echo "📄 Buscando main.js en contenedor:"
docker exec $CONTAINER_ID find /app/dist -name "main.js" -type f || echo "❌ main.js no encontrado"

echo "🔧 Verificando script de inicio:"
docker exec $CONTAINER_ID ls -la /app/start.sh || echo "❌ start.sh no encontrado"

# Limpiar contenedor temporal
echo "🧹 Limpiando contenedor temporal..."
docker stop $CONTAINER_ID > /dev/null 2>&1 || true

echo ""
echo "✅ Verificación completada!"
echo ""
echo "📋 Resultado:"
echo "Si no hay errores arriba, Docker debería funcionar correctamente."
echo ""
echo "🚀 Para desplegar en VPS:"
echo "1. Copiar archivos al servidor"
echo "2. Ejecutar: docker-compose up -d"
echo "3. Verificar logs: docker-compose logs agendoo-api"