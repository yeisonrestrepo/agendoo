#!/bin/bash

# =====================================
# Agendoo - Script de Inicio
# =====================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[AGENDOO]${NC} $1"
}

success() {
    echo -e "${GREEN}[AGENDOO]${NC} ✅ $1"
}

warning() {
    echo -e "${YELLOW}[AGENDOO]${NC} ⚠️  $1"
}

error() {
    echo -e "${RED}[AGENDOO]${NC} ❌ $1"
    exit 1
}

# =====================================
# Pre-requisitos y validaciones
# =====================================

log "Iniciando Agendoo API..."
log "Fecha: $(date)"

# Verificar que Docker esté disponible
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado o no está en el PATH"
fi

# Verificar que Docker Compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado o no está en el PATH"
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml en el directorio actual"
fi

if [ ! -f "Dockerfile" ]; then
    error "No se encontró Dockerfile en el directorio actual"
fi

# =====================================
# Verificar archivo .env
# =====================================

if [ ! -f ".env.production" ]; then
    warning "No se encontró .env.production, creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        warning "Revisa y actualiza las variables en .env.production antes de continuar"
    else
        error "No se encontró .env.example para crear .env.production"
    fi
fi

# =====================================
# Crear directorios necesarios
# =====================================

log "Creando directorios necesarios..."

mkdir -p logs/agendoo
mkdir -p uploads
mkdir -p temp
mkdir -p data/agendoo/postgres
mkdir -p backups/agendoo
mkdir -p sql/agendoo

success "Directorios creados correctamente"

# =====================================
# Verificar conflictos de puerto
# =====================================

log "Verificando disponibilidad de puertos..."

# Puerto 4000 (Agendoo API)
if netstat -tuln 2>/dev/null | grep -q ":4000 "; then
    warning "El puerto 4000 ya está en uso. Verificando si es Agendoo..."
    if docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -q "agendoo-api"; then
        log "Agendoo ya está ejecutándose. Deteniendo para reiniciar..."
        docker-compose down
    else
        error "El puerto 4000 está ocupado por otro servicio"
    fi
fi

# Puerto 5433 (Agendoo PostgreSQL)
if netstat -tuln 2>/dev/null | grep -q ":5433 "; then
    warning "El puerto 5433 ya está en uso"
    if ! docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -q "agendoo-postgres"; then
        error "El puerto 5433 está ocupado por otro servicio"
    fi
fi

# =====================================
# Construir y ejecutar contenedores
# =====================================

log "Construyendo imágenes de Docker..."
docker-compose build --no-cache

log "Iniciando servicios de Agendoo..."
docker-compose up -d

# =====================================
# Esperar a que los servicios estén listos
# =====================================

log "Esperando a que PostgreSQL esté listo..."
timeout=60
counter=0

while ! docker-compose exec -T agendoo-postgres pg_isready -U agendoo_user -d agendoo_db &>/dev/null; do
    if [ $counter -ge $timeout ]; then
        error "Timeout esperando a PostgreSQL"
    fi
    sleep 2
    counter=$((counter + 2))
    printf "."
done

success "PostgreSQL está listo"

log "Esperando a que Agendoo API esté listo..."
timeout=120
counter=0

while ! curl -f http://localhost:4000/health &>/dev/null; do
    if [ $counter -ge $timeout ]; then
        error "Timeout esperando a Agendoo API"
    fi
    sleep 3
    counter=$((counter + 3))
    printf "."
done

success "Agendoo API está listo"

# =====================================
# Verificación final
# =====================================

log "Verificando estado de los contenedores..."
docker-compose ps

echo ""
success "🚀 Agendoo iniciado correctamente!"
echo ""
log "📍 Servicios disponibles:"
log "   • API GraphQL: http://localhost:4000/graphql"
log "   • Health Check: http://localhost:4000/health"
log "   • PostgreSQL: localhost:5433"
echo ""
log "📋 Comandos útiles:"
log "   • Ver logs: docker-compose logs -f agendoo-api"
log "   • Parar servicio: ./stop.sh"
log "   • Reiniciar: ./stop.sh && ./start.sh"
echo ""
warning "💡 Recuerda configurar las variables de entorno en .env.production"