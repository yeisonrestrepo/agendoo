#!/bin/bash
# =====================================
# Script para probar conectividad desde Agendoo
# =====================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Parámetros
DB_HOST=${1:-"host.docker.internal"}
DB_PORT=${2:-"5432"}
REDIS_HOST=${3:-"host.docker.internal"}
REDIS_PORT=${4:-"6379"}
NETWORK=${5:-"bridge"}

echo -e "${BLUE}🧪 Probando conectividad desde contenedor Agendoo...${NC}"
echo "=================================================="
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "REDIS_HOST: $REDIS_HOST"
echo "REDIS_PORT: $REDIS_PORT"
echo "NETWORK: $NETWORK"
echo ""

# =====================================
# 1. Probar conectividad PostgreSQL
# =====================================
echo -e "${YELLOW}🐘 Probando conectividad PostgreSQL...${NC}"

# Crear contenedor temporal con la misma red
echo "Creando contenedor temporal en red '$NETWORK'..."

if [ "$NETWORK" = "bridge" ]; then
    NETWORK_FLAG=""
else
    NETWORK_FLAG="--network $NETWORK"
fi

# Test PostgreSQL con pg_isready
echo "Probando pg_isready..."
if docker run --rm $NETWORK_FLAG postgres:15 pg_isready -h "$DB_HOST" -p "$DB_PORT" -t 5; then
    echo -e "${GREEN}✅ PostgreSQL está accesible en $DB_HOST:$DB_PORT${NC}"
    
    # Intentar conexión más específica (requiere credenciales)
    echo "Probando conexión con psql (puede fallar sin credenciales)..."
    docker run --rm $NETWORK_FLAG \
        -e PGPASSWORD=test \
        postgres:15 \
        psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -d postgres -c "SELECT version();" \
        2>/dev/null && echo -e "${GREEN}✅ Conexión psql exitosa${NC}" || echo -e "${YELLOW}⚠️ psql falló (credenciales incorrectas, pero conectividad OK)${NC}"
else
    echo -e "${RED}❌ PostgreSQL NO accesible en $DB_HOST:$DB_PORT${NC}"
fi

# =====================================
# 2. Probar conectividad Redis
# =====================================
echo -e "\n${YELLOW}🔴 Probando conectividad Redis...${NC}"

if docker run --rm $NETWORK_FLAG redis:7 redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -c 1 ping 2>/dev/null; then
    echo -e "${GREEN}✅ Redis está accesible en $REDIS_HOST:$REDIS_PORT${NC}"
    
    # Probar comandos básicos
    echo "Probando comandos Redis..."
    docker run --rm $NETWORK_FLAG \
        redis:7 \
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" \
        --eval <(echo 'redis.call("set", "test_agendoo", "hello"); return redis.call("get", "test_agendoo")') \
        2>/dev/null && echo -e "${GREEN}✅ Comandos Redis funcionan${NC}" || echo -e "${YELLOW}⚠️ Comandos Redis requieren autenticación${NC}"
else
    echo -e "${RED}❌ Redis NO accesible en $REDIS_HOST:$REDIS_PORT${NC}"
fi

# =====================================
# 3. Probar desde contenedor Agendoo específicamente
# =====================================
echo -e "\n${YELLOW}🚀 Probando desde contenedor Agendoo...${NC}"

# Verificar si la imagen de Agendoo existe
if docker images | grep -q "agendoo.*agendoo-api"; then
    echo "Imagen Agendoo encontrada, probando conectividad..."
    
    # Crear contenedor Agendoo temporal para probar
    echo "Creando contenedor Agendoo temporal..."
    AGENDOO_TEST_ID=$(docker run -d --rm $NETWORK_FLAG \
        -e DB_HOST="$DB_HOST" \
        -e DB_PORT="$DB_PORT" \
        -e REDIS_HOST="$REDIS_HOST" \
        -e REDIS_PORT="$REDIS_PORT" \
        -e RUN_MIGRATIONS=false \
        agendoo_agendoo-api:latest \
        sleep 60)
    
    echo "Contenedor temporal creado: $AGENDOO_TEST_ID"
    
    # Esperar que inicie
    sleep 3
    
    # Probar conectividad desde dentro del contenedor
    echo "Probando PostgreSQL desde Agendoo..."
    if docker exec $AGENDOO_TEST_ID sh -c "nc -z $DB_HOST $DB_PORT" 2>/dev/null; then
        echo -e "${GREEN}✅ Agendoo puede conectar a PostgreSQL${NC}"
    else
        echo -e "${RED}❌ Agendoo NO puede conectar a PostgreSQL${NC}"
    fi
    
    echo "Probando Redis desde Agendoo..."
    if docker exec $AGENDOO_TEST_ID sh -c "nc -z $REDIS_HOST $REDIS_PORT" 2>/dev/null; then
        echo -e "${GREEN}✅ Agendoo puede conectar a Redis${NC}"
    else
        echo -e "${RED}❌ Agendoo NO puede conectar a Redis${NC}"
    fi
    
    # Mostrar resolución DNS desde el contenedor
    echo "Probando resolución DNS..."
    echo "DB_HOST ($DB_HOST) resuelve a:"
    docker exec $AGENDOO_TEST_ID nslookup "$DB_HOST" 2>/dev/null | grep "Address:" | tail -1 || echo "  No se pudo resolver"
    
    # Limpiar contenedor temporal
    echo "Limpiando contenedor temporal..."
    docker stop $AGENDOO_TEST_ID >/dev/null 2>&1 || true
    
else
    echo -e "${YELLOW}⚠️ Imagen Agendoo no encontrada. Construye primero con: docker-compose build${NC}"
fi

# =====================================
# 4. Resumen y recomendaciones
# =====================================
echo -e "\n${YELLOW}📋 Resumen y recomendaciones:${NC}"
echo "=============================================="

# Detectar contenedores de BD en la red
if [ "$NETWORK" != "bridge" ]; then
    echo "Contenedores en la red '$NETWORK':"
    docker network inspect "$NETWORK" --format '{{range $id, $conf := .Containers}}  📦 {{$conf.Name}} ({{$conf.IPv4Address}}){{"\n"}}{{end}}' 2>/dev/null || echo "  No se pudo obtener información de la red"
fi

echo ""
echo "Para usar en .env.production:"
echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"
echo "REDIS_HOST=$REDIS_HOST" 
echo "REDIS_PORT=$REDIS_PORT"

echo ""
echo "Para usar en docker-compose.yml:"
if [ "$NETWORK" != "bridge" ]; then
    echo "networks:"
    echo "  - $NETWORK"
    echo ""
    echo "# Y al final del archivo:"
    echo "networks:"
    echo "  $NETWORK:"
    echo "    external: true"
fi

echo -e "\n${GREEN}✅ Prueba de conectividad completada${NC}"