#!/bin/bash
# =====================================
# Script para configurar red automáticamente
# =====================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configurando red para Agendoo...${NC}"
echo "=================================================="

# =====================================
# 1. Detectar contenedores existentes
# =====================================
echo -e "${YELLOW}🔍 Detectando contenedores de base de datos...${NC}"

# Buscar contenedores PostgreSQL
POSTGRES_CONTAINERS=$(docker ps --format "{{.Names}}" | grep -i postgres || echo "")
POSTGRES_PORT_CONTAINERS=$(docker ps --filter "expose=5432" --format "{{.Names}}" || echo "")

# Buscar contenedores Redis  
REDIS_CONTAINERS=$(docker ps --format "{{.Names}}" | grep -i redis || echo "")
REDIS_PORT_CONTAINERS=$(docker ps --filter "expose=6379" --format "{{.Names}}" || echo "")

# Combinar y obtener único
ALL_DB_CONTAINERS="$POSTGRES_CONTAINERS $POSTGRES_PORT_CONTAINERS $REDIS_CONTAINERS $REDIS_PORT_CONTAINERS"
DB_CONTAINERS=$(echo $ALL_DB_CONTAINERS | tr ' ' '\n' | sort -u | grep -v "^$" || echo "")

if [ -z "$DB_CONTAINERS" ]; then
    echo -e "${RED}❌ No se encontraron contenedores de base de datos activos${NC}"
    echo "Asegúrate de que PostgreSQL/Redis estén corriendo en contenedores"
    exit 1
fi

echo -e "${GREEN}✅ Contenedores de BD encontrados:${NC}"
for container in $DB_CONTAINERS; do
    echo "  📦 $container"
done

# =====================================
# 2. Detectar red principal
# =====================================
echo -e "\n${YELLOW}🌐 Detectando red principal...${NC}"

# Obtener la red más común (excluyendo bridge default)
MAIN_NETWORK=""
for container in $DB_CONTAINERS; do
    networks=$(docker inspect $container --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}')
    for net in $networks; do
        if [ "$net" != "bridge" ]; then
            echo "$net"
        fi
    done
done | sort | uniq -c | sort -nr | head -1 | awk '{print $2}' > /tmp/main_network

MAIN_NETWORK=$(cat /tmp/main_network 2>/dev/null || echo "")

if [ -z "$MAIN_NETWORK" ]; then
    # Si no hay red custom, usar bridge
    MAIN_NETWORK="bridge"
    echo -e "${YELLOW}⚠️ Usando red bridge por defecto${NC}"
else
    echo -e "${GREEN}✅ Red principal detectada: $MAIN_NETWORK${NC}"
fi

# =====================================
# 3. Obtener información de contenedores en la red
# =====================================
echo -e "\n${YELLOW}📋 Información de contenedores en red '$MAIN_NETWORK':${NC}"

POSTGRES_HOST=""
REDIS_HOST=""

for container in $DB_CONTAINERS; do
    # Verificar si el contenedor está en la red principal
    container_networks=$(docker inspect $container --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}')
    
    if echo "$container_networks" | grep -q "$MAIN_NETWORK" || [ "$MAIN_NETWORK" = "bridge" ]; then
        # Obtener IP en la red
        if [ "$MAIN_NETWORK" = "bridge" ]; then
            container_ip=$(docker inspect $container --format '{{.NetworkSettings.IPAddress}}')
        else
            container_ip=$(docker inspect $container --format "{{.NetworkSettings.Networks.$MAIN_NETWORK.IPAddress}}")
        fi
        
        # Determinar puertos expuestos
        ports=$(docker inspect $container --format '{{.NetworkSettings.Ports}}')
        
        echo "  📦 $container ($container_ip)"
        
        # Identificar tipo de servicio
        if echo "$ports" | grep -q "5432" || echo "$container" | grep -i "postgres"; then
            POSTGRES_HOST="$container"
            echo "    🐘 PostgreSQL detectado"
        fi
        
        if echo "$ports" | grep -q "6379" || echo "$container" | grep -i "redis"; then
            REDIS_HOST="$container"
            echo "    🔴 Redis detectado"
        fi
    fi
done

# =====================================
# 4. Generar configuración
# =====================================
echo -e "\n${YELLOW}⚙️ Generando configuración...${NC}"

# Crear archivo .env para docker-compose
if [ "$MAIN_NETWORK" != "bridge" ]; then
    cat > .env << EOF
# Configuración de red generada automáticamente
EXTERNAL_NETWORK=true
NETWORK_NAME=$MAIN_NETWORK
EOF
    echo -e "${GREEN}✅ Archivo .env creado para usar red externa '$MAIN_NETWORK'${NC}"
else
    cat > .env << EOF
# Configuración de red generada automáticamente
EXTERNAL_NETWORK=false
NETWORK_NAME=agendoo_default
EOF
    echo -e "${GREEN}✅ Archivo .env creado para usar red por defecto${NC}"
fi

# Actualizar .env.production con hosts detectados
echo -e "\n${YELLOW}📝 Actualizando .env.production...${NC}"

# Backup del archivo original
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup
    echo "✅ Backup creado: .env.production.backup"
fi

# Leer archivo actual o crear uno nuevo
if [ -f ".env.production" ]; then
    ENV_CONTENT=$(cat .env.production)
else
    ENV_CONTENT=""
fi

# Actualizar o agregar configuraciones
if [ -n "$POSTGRES_HOST" ]; then
    if echo "$ENV_CONTENT" | grep -q "^DB_HOST="; then
        sed -i "s/^DB_HOST=.*/DB_HOST=$POSTGRES_HOST/" .env.production
    else
        echo "DB_HOST=$POSTGRES_HOST" >> .env.production
    fi
    echo "✅ DB_HOST configurado: $POSTGRES_HOST"
fi

if [ -n "$REDIS_HOST" ]; then
    if echo "$ENV_CONTENT" | grep -q "^REDIS_HOST="; then
        sed -i "s/^REDIS_HOST=.*/REDIS_HOST=$REDIS_HOST/" .env.production
    else
        echo "REDIS_HOST=$REDIS_HOST" >> .env.production
    fi
    echo "✅ REDIS_HOST configurado: $REDIS_HOST"
fi

# =====================================
# 5. Probar conectividad
# =====================================
echo -e "\n${YELLOW}🧪 Probando conectividad...${NC}"

chmod +x test-connectivity.sh 2>/dev/null || echo "# Crear test-connectivity.sh para pruebas completas"

# Prueba básica
if [ -n "$POSTGRES_HOST" ]; then
    echo "Probando PostgreSQL ($POSTGRES_HOST)..."
    if [ "$MAIN_NETWORK" = "bridge" ]; then
        docker run --rm postgres:15 pg_isready -h "$POSTGRES_HOST" -p 5432 -t 5 && echo -e "${GREEN}✅ PostgreSQL accesible${NC}" || echo -e "${RED}❌ PostgreSQL no accesible${NC}"
    else
        docker run --rm --network "$MAIN_NETWORK" postgres:15 pg_isready -h "$POSTGRES_HOST" -p 5432 -t 5 && echo -e "${GREEN}✅ PostgreSQL accesible${NC}" || echo -e "${RED}❌ PostgreSQL no accesible${NC}"
    fi
fi

if [ -n "$REDIS_HOST" ]; then
    echo "Probando Redis ($REDIS_HOST)..."
    if [ "$MAIN_NETWORK" = "bridge" ]; then
        docker run --rm redis:7 redis-cli -h "$REDIS_HOST" -p 6379 -c 1 ping && echo -e "${GREEN}✅ Redis accesible${NC}" || echo -e "${RED}❌ Redis no accesible${NC}"
    else
        docker run --rm --network "$MAIN_NETWORK" redis:7 redis-cli -h "$REDIS_HOST" -p 6379 -c 1 ping && echo -e "${GREEN}✅ Redis accesible${NC}" || echo -e "${RED}❌ Redis no accesible${NC}"
    fi
fi

# =====================================
# 6. Instrucciones finales
# =====================================
echo -e "\n${GREEN}🎉 Configuración completada!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📋 Resumen de configuración:${NC}"
echo "  🌐 Red: $MAIN_NETWORK"
[ -n "$POSTGRES_HOST" ] && echo "  🐘 PostgreSQL: $POSTGRES_HOST:5432"
[ -n "$REDIS_HOST" ] && echo "  🔴 Redis: $REDIS_HOST:6379"
echo ""
echo -e "${BLUE}📝 Archivos actualizados:${NC}"
echo "  ✅ .env (configuración de red para docker-compose)"
echo "  ✅ .env.production (variables de entorno actualizadas)"
echo ""
echo -e "${BLUE}🚀 Para desplegar:${NC}"
if [ "$MAIN_NETWORK" != "bridge" ]; then
    echo "  docker-compose -f docker-compose-network.yml up -d"
else
    echo "  docker-compose up -d"
fi
echo ""
echo -e "${BLUE}🧪 Para probar conectividad completa:${NC}"
echo "  ./test-connectivity.sh $POSTGRES_HOST 5432 $REDIS_HOST 6379 $MAIN_NETWORK"

# Limpiar archivos temporales
rm -f /tmp/main_network