#!/bin/bash
# =====================================
# Script corregido para redes con caracteres especiales
# =====================================

set -e

# Usando la información detectada
MAIN_NETWORK="deriv-trading-bot_trading-network"
POSTGRES_HOST="trading-postgres-prod"
REDIS_HOST="trading-redis-prod"

echo "🔧 Configurando red para Agendoo..."
echo "=================================="
echo "Red detectada: $MAIN_NETWORK"
echo "PostgreSQL: $POSTGRES_HOST"
echo "Redis: $REDIS_HOST"
echo ""

# 1. Crear archivo .env para docker-compose
echo "📝 Creando archivo .env..."
cat > .env << EOF
# Configuración de red generada automáticamente
EXTERNAL_NETWORK=true
NETWORK_NAME=$MAIN_NETWORK
EOF

echo "✅ Archivo .env creado"

# 2. Actualizar .env.production
echo "📝 Actualizando .env.production..."

# Backup
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
    echo "✅ Backup creado: .env.production.backup"
fi

# Actualizar o agregar DB_HOST
if grep -q "^DB_HOST=" .env.production 2>/dev/null; then
    sed -i "s/^DB_HOST=.*/DB_HOST=$POSTGRES_HOST/" .env.production
else
    echo "DB_HOST=$POSTGRES_HOST" >> .env.production
fi

# Actualizar o agregar REDIS_HOST
if grep -q "^REDIS_HOST=" .env.production 2>/dev/null; then
    sed -i "s/^REDIS_HOST=.*/REDIS_HOST=$REDIS_HOST/" .env.production
else
    echo "REDIS_HOST=$REDIS_HOST" >> .env.production
fi

echo "✅ Variables de entorno actualizadas"

# 3. Mostrar configuración
echo ""
echo "📋 Configuración de red (.env):"
cat .env

echo ""
echo "📋 Hosts de base de datos (.env.production):"
grep -E "(DB_HOST|REDIS_HOST)" .env.production

# 4. Probar conectividad
echo ""
echo "🧪 Probando conectividad..."

echo "Probando PostgreSQL..."
if docker run --rm --network "$MAIN_NETWORK" postgres:15 pg_isready -h "$POSTGRES_HOST" -p 5432 -t 5 >/dev/null 2>&1; then
    echo "✅ PostgreSQL accesible"
else
    echo "❌ PostgreSQL no accesible"
fi

echo "Probando Redis..."
if docker run --rm --network "$MAIN_NETWORK" redis:7 redis-cli -h "$REDIS_HOST" -p 6379 -c 1 ping >/dev/null 2>&1; then
    echo "✅ Redis accesible"
else
    echo "❌ Redis no accesible"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "Para desplegar Agendoo:"
echo "  docker-compose -f docker-compose-network.yml up -d"
echo ""
echo "Para verificar logs:"
echo "  docker-compose logs agendoo-api"