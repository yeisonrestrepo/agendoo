#!/bin/bash
# =====================================
# Script para detectar configuración de red Docker
# =====================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Detectando configuración de red Docker...${NC}"
echo "=================================================="

# =====================================
# 1. Listar todas las redes Docker
# =====================================
echo -e "\n${YELLOW}📐 Redes Docker disponibles:${NC}"
docker network ls

# =====================================
# 2. Detectar contenedores PostgreSQL/Redis
# =====================================
echo -e "\n${YELLOW}🐘 Contenedores PostgreSQL activos:${NC}"
POSTGRES_CONTAINERS=$(docker ps --filter "ancestor=postgres" --format "{{.Names}}" 2>/dev/null || echo "")
POSTGRES_CONTAINERS_ANY=$(docker ps --filter "expose=5432" --format "{{.Names}}" 2>/dev/null || echo "")

if [ ! -z "$POSTGRES_CONTAINERS" ]; then
    echo -e "${GREEN}Contenedores PostgreSQL (imagen postgres):${NC}"
    for container in $POSTGRES_CONTAINERS; do
        echo "  📦 $container"
    done
fi

if [ ! -z "$POSTGRES_CONTAINERS_ANY" ]; then
    echo -e "${GREEN}Contenedores con puerto 5432 expuesto:${NC}"
    for container in $POSTGRES_CONTAINERS_ANY; do
        echo "  📦 $container"
    done
fi

echo -e "\n${YELLOW}🔴 Contenedores Redis activos:${NC}"
REDIS_CONTAINERS=$(docker ps --filter "ancestor=redis" --format "{{.Names}}" 2>/dev/null || echo "")
REDIS_CONTAINERS_ANY=$(docker ps --filter "expose=6379" --format "{{.Names}}" 2>/dev/null || echo "")

if [ ! -z "$REDIS_CONTAINERS" ]; then
    echo -e "${GREEN}Contenedores Redis (imagen redis):${NC}"
    for container in $REDIS_CONTAINERS; do
        echo "  📦 $container"
    done
fi

if [ ! -z "$REDIS_CONTAINERS_ANY" ]; then
    echo -e "${GREEN}Contenedores con puerto 6379 expuesto:${NC}"
    for container in $REDIS_CONTAINERS_ANY; do
        echo "  📦 $container"
    done
fi

# =====================================
# 3. Obtener información detallada de cada contenedor
# =====================================
echo -e "\n${YELLOW}🌐 Información de red de contenedores:${NC}"

ALL_DB_CONTAINERS="$POSTGRES_CONTAINERS $POSTGRES_CONTAINERS_ANY $REDIS_CONTAINERS $REDIS_CONTAINERS_ANY"
UNIQUE_CONTAINERS=$(echo $ALL_DB_CONTAINERS | tr ' ' '\n' | sort -u | tr '\n' ' ')

for container in $UNIQUE_CONTAINERS; do
    if [ ! -z "$container" ]; then
        echo -e "\n${BLUE}📦 Contenedor: $container${NC}"
        
        # Red del contenedor
        NETWORKS=$(docker inspect $container --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}' 2>/dev/null || echo "N/A")
        echo "  🌐 Redes: $NETWORKS"
        
        # IP del contenedor
        IPS=$(docker inspect $container --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}}:{{$conf.IPAddress}} {{end}}' 2>/dev/null || echo "N/A")
        echo "  🔢 IPs: $IPS"
        
        # Puertos expuestos
        PORTS=$(docker inspect $container --format '{{.NetworkSettings.Ports}}' 2>/dev/null || echo "N/A")
        echo "  🔌 Puertos: $PORTS"
        
        # Variables de entorno relevantes
        echo "  🔧 Variables relevantes:"
        docker exec $container env 2>/dev/null | grep -E "(POSTGRES_|MYSQL_|REDIS_)" | head -5 | sed 's/^/    /' || echo "    No hay variables de DB disponibles"
    fi
done

# =====================================
# 4. Sugerencias de configuración
# =====================================
echo -e "\n${YELLOW}💡 Sugerencias de configuración:${NC}"
echo "=============================================="

# Encontrar la red más común
COMMON_NETWORK=""
if [ ! -z "$UNIQUE_CONTAINERS" ]; then
    # Obtener la red más usada (excluyendo bridge por defecto)
    COMMON_NETWORK=$(docker inspect $UNIQUE_CONTAINERS 2>/dev/null | jq -r '.[].NetworkSettings.Networks | keys[]' 2>/dev/null | grep -v "bridge" | sort | uniq -c | sort -nr | head -1 | awk '{print $2}' || echo "")
    
    if [ -z "$COMMON_NETWORK" ]; then
        COMMON_NETWORK=$(docker inspect $UNIQUE_CONTAINERS 2>/dev/null | jq -r '.[].NetworkSettings.Networks | keys[]' 2>/dev/null | head -1 || echo "bridge")
    fi
fi

if [ ! -z "$COMMON_NETWORK" ]; then
    echo -e "${GREEN}🌐 Red detectada para usar: $COMMON_NETWORK${NC}"
    
    # Obtener información de la red
    echo -e "\n${BLUE}📋 Información de la red '$COMMON_NETWORK':${NC}"
    docker network inspect $COMMON_NETWORK --format '{{.Name}}: {{.Driver}} ({{.Scope}})' 2>/dev/null || echo "  No se pudo obtener información"
    
    echo -e "\n${BLUE}📦 Contenedores en esta red:${NC}"
    docker network inspect $COMMON_NETWORK --format '{{range $id, $conf := .Containers}}{{$conf.Name}} ({{$conf.IPv4Address}}){{"\n"}}{{end}}' 2>/dev/null || echo "  No se pudo obtener contenedores"
fi

# =====================================
# 5. Configuración recomendada para docker-compose
# =====================================
echo -e "\n${YELLOW}⚙️  Configuración recomendada para docker-compose.yml:${NC}"
echo "=============================================="

if [ ! -z "$COMMON_NETWORK" ] && [ "$COMMON_NETWORK" != "bridge" ]; then
    echo "# Usar red externa existente:"
    echo "version: '3.8'"
    echo "services:"
    echo "  agendoo-api:"
    echo "    # ... tu configuración ..."
    echo "    networks:"
    echo "      - $COMMON_NETWORK"
    echo ""
    echo "networks:"
    echo "  $COMMON_NETWORK:"
    echo "    external: true"
    echo ""
    
    # Buscar el contenedor de PostgreSQL específico para sugerir DB_HOST
    POSTGRES_IN_NETWORK=$(docker network inspect $COMMON_NETWORK --format '{{range $id, $conf := .Containers}}{{if eq $conf.Name "'$(echo $POSTGRES_CONTAINERS $POSTGRES_CONTAINERS_ANY | awk '{print $1}')'")}}{{$conf.Name}}{{end}}{{end}}' 2>/dev/null || echo "")
    
    if [ ! -z "$POSTGRES_IN_NETWORK" ]; then
        echo "# Variables de entorno sugeridas:"
        echo "DB_HOST=$POSTGRES_IN_NETWORK"
        echo "DB_PORT=5432"
    fi
    
    # Lo mismo para Redis
    REDIS_IN_NETWORK=$(docker network inspect $COMMON_NETWORK --format '{{range $id, $conf := .Containers}}{{if eq $conf.Name "'$(echo $REDIS_CONTAINERS $REDIS_CONTAINERS_ANY | awk '{print $1}')'")}}{{$conf.Name}}{{end}}{{end}}' 2>/dev/null || echo "")
    
    if [ ! -z "$REDIS_IN_NETWORK" ]; then
        echo "REDIS_HOST=$REDIS_IN_NETWORK"
        echo "REDIS_PORT=6379"
    fi
else
    echo "# Usar red bridge por defecto:"
    echo "# DB_HOST=host.docker.internal  # Para conectar al host"
    echo "# O usar las IPs de contenedor detectadas arriba"
fi

# =====================================
# 6. Comando de prueba de conectividad
# =====================================
echo -e "\n${YELLOW}🧪 Comandos para probar conectividad:${NC}"
echo "=============================================="

if [ ! -z "$POSTGRES_CONTAINERS" ]; then
    FIRST_PG=$(echo $POSTGRES_CONTAINERS | awk '{print $1}')
    echo "# Probar conectividad a PostgreSQL:"
    echo "docker run --rm --network $COMMON_NETWORK postgres:15 pg_isready -h $FIRST_PG -p 5432"
fi

if [ ! -z "$REDIS_CONTAINERS" ]; then
    FIRST_REDIS=$(echo $REDIS_CONTAINERS | awk '{print $1}')
    echo "# Probar conectividad a Redis:"
    echo "docker run --rm --network $COMMON_NETWORK redis:7 redis-cli -h $FIRST_REDIS -p 6379 ping"
fi

echo -e "\n${GREEN}✅ Detección completada${NC}"
echo "Usa la información de arriba para configurar tu docker-compose.yml"