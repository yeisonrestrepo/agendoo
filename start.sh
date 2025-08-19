#!/bin/sh
set -e

echo "🚀 Starting Agendoo Backend..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database Host: $DB_HOST"

# Cargar variables de entorno desde archivo si existe
if [ -f "/app/.env.production" ]; then
  echo "📋 Loading environment variables from .env.production..."
  export $(grep -v '^#' /app/.env.production | xargs)
  echo "✅ Environment variables loaded"
else
  echo "⚠️  .env.production not found, using environment variables from docker-compose"
fi

# Mostrar algunas variables críticas (sin mostrar secretos)
echo "🔧 Configuration check:"
echo "  NODE_ENV: $NODE_ENV"
echo "  DB_HOST: $DB_HOST"
echo "  JWT_SECRET: ${JWT_SECRET:+[CONFIGURED]}${JWT_SECRET:-[NOT SET]}"
echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:+[CONFIGURED]}${GOOGLE_CLIENT_ID:-[NOT SET]}"

# Detectar ubicación de archivos automáticamente
if [ -f "/app/dist/main.js" ]; then
  MAIN_FILE="/app/dist/main.js"
elif [ -f "/app/dist/src/main.js" ]; then
  MAIN_FILE="/app/dist/src/main.js"
else
  echo "❌ Cannot find main.js file"
  echo "📁 Available files in dist:"
  find /app/dist -name "*.js" | head -10
  exit 1
fi

echo "📄 Using main file: $MAIN_FILE"

# Ejecutar migraciones si está habilitado
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📊 Running database migrations..."
  
  # Detectar ubicación de data-source.js
  if [ -f "/app/dist/data-source.js" ]; then
    DATA_SOURCE_FILE="/app/dist/data-source.js"
  elif [ -f "/app/dist/src/data-source.js" ]; then
    DATA_SOURCE_FILE="/app/dist/src/data-source.js"
  else
    echo "⚠️ data-source.js not found, skipping migrations"
    echo "📁 Available files:"
    find /app/dist -name "*data-source*" -o -name "*migration*" | head -5
    DATA_SOURCE_FILE=""
  fi
  
  if [ -n "$DATA_SOURCE_FILE" ]; then
    echo "📄 Using data source: $DATA_SOURCE_FILE"
    yarn typeorm migration:run -d "$DATA_SOURCE_FILE" || echo "⚠️ Migrations failed, continuing..."
  fi
else
  echo "🚫 Migrations disabled (RUN_MIGRATIONS=$RUN_MIGRATIONS)"
fi

# Iniciar la aplicación
echo "🎯 Starting application..."
exec dumb-init node "$MAIN_FILE"