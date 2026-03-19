#!/bin/bash

# =====================================
# Agendoo - Script de Detención
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
# Validaciones iniciales
# =====================================

log "Deteniendo Agendoo API..."
log "Fecha: $(date)"

# Verificar que Docker Compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado o no está en el PATH"
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    error "No se encontró docker-compose.yml en el directorio actual"
fi

# =====================================
# Verificar estado actual
# =====================================

log "Verificando estado actual de los contenedores..."

# Verificar si hay contenedores de Agendoo ejecutándose
if ! docker-compose ps --services --filter "status=running" | grep -q .; then
    warning "No hay contenedores de Agendoo ejecutándose"
    exit 0
fi

# Mostrar contenedores activos antes de detener
echo ""
log "Contenedores activos de Agendoo:"
docker-compose ps
echo ""

# =====================================
# Opción de detención
# =====================================

# Verificar si se pasó parámetro para forzar eliminación
FORCE_REMOVE=false
REMOVE_VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f)
            FORCE_REMOVE=true
            shift
            ;;
        --volumes|-v)
            REMOVE_VOLUMES=true
            shift
            ;;
        --help|-h)
            echo "Uso: $0 [OPCIONES]"
            echo ""
            echo "Opciones:"
            echo "  -f, --force     Forzar eliminación de contenedores e imágenes"
            echo "  -v, --volumes   Eliminar también los volúmenes (¡CUIDADO: Elimina datos!)"
            echo "  -h, --help      Mostrar esta ayuda"
            echo ""
            echo "Ejemplos:"
            echo "  $0              # Detener servicios normalmente"
            echo "  $0 --force      # Detener y eliminar contenedores/imágenes"
            echo "  $0 --volumes    # Detener y eliminar también volúmenes"
            exit 0
            ;;
        *)
            error "Opción desconocida: $1"
            ;;
    esac
done

# =====================================
# Proceso de detención
# =====================================

if [ "$FORCE_REMOVE" = true ]; then
    warning "Modo FORCE activado - Se eliminarán contenedores e imágenes"
    read -p "¿Estás seguro? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operación cancelada"
        exit 0
    fi
fi

if [ "$REMOVE_VOLUMES" = true ]; then
    warning "Se eliminarán los volúmenes - ¡TODOS LOS DATOS SE PERDERÁN!"
    read -p "¿Estás ABSOLUTAMENTE seguro? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Operación cancelada"
        exit 0
    fi
fi

# Detener contenedores de forma elegante
log "Deteniendo contenedores de Agendoo..."
docker-compose stop

success "Contenedores detenidos correctamente"

# =====================================
# Limpieza según opciones
# =====================================

if [ "$FORCE_REMOVE" = true ]; then
    log "Eliminando contenedores..."
    docker-compose rm -f
    
    log "Eliminando imágenes de Agendoo..."
    if docker images | grep -q "agendoo"; then
        docker images | grep "agendoo" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
    fi
    
    # Limpiar imágenes huérfanas
    log "Limpiando imágenes huérfanas..."
    docker image prune -f
    
    success "Contenedores e imágenes eliminados"
fi

if [ "$REMOVE_VOLUMES" = true ]; then
    warning "Eliminando volúmenes..."
    docker-compose down --volumes
    
    # Eliminar directorios de datos locales (con confirmación adicional)
    if [ -d "data/agendoo" ]; then
        warning "¿Eliminar también datos locales en ./data/agendoo? [y/N]: "
        read -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf data/agendoo
            log "Datos locales eliminados"
        fi
    fi
    
    success "Volúmenes eliminados"
else
    # Detención normal - solo down
    docker-compose down
fi

# =====================================
# Verificación final
# =====================================

log "Verificando que no hay contenedores de Agendoo ejecutándose..."

if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "agendoo"; then
    echo ""
    warning "Contenedores de Agendoo restantes:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "agendoo"
else
    success "No hay contenedores de Agendoo ejecutándose"
fi

# Verificar puertos liberados
log "Verificando liberación de puertos..."

if netstat -tuln 2>/dev/null | grep -q ":4000 "; then
    warning "El puerto 4000 sigue ocupado"
else
    success "Puerto 4000 liberado"
fi

if netstat -tuln 2>/dev/null | grep -q ":5433 "; then
    warning "El puerto 5433 sigue ocupado"
else
    success "Puerto 5433 liberado"
fi

# =====================================
# Resumen final
# =====================================

echo ""
success "🛑 Agendoo detenido correctamente!"
echo ""
log "📋 Información:"

if [ "$FORCE_REMOVE" = true ]; then
    log "   • Contenedores eliminados"
    log "   • Imágenes eliminadas"
else
    log "   • Contenedores detenidos (no eliminados)"
    log "   • Para iniciar: ./start.sh"
fi

if [ "$REMOVE_VOLUMES" = true ]; then
    warning "   • Volúmenes eliminados - datos perdidos"
else
    log "   • Datos preservados en volúmenes"
fi

echo ""
log "📝 Comandos útiles:"
log "   • Reiniciar: ./start.sh"
log "   • Ver contenedores: docker ps -a | grep agendoo"
log "   • Limpiar todo: ./stop.sh --force --volumes"