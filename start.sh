#!/bin/sh
set -e

echo "🚀 Starting Agendoo Backend..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database Host: $DB_HOST"

# Detectar ubicación de main.js automáticamente
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
    yarn typeorm migration:run -d /app/dist/data-source.js
  elif [ -f "/app/dist/src/data-source.js" ]; then
    yarn typeorm migration:run -d /app/dist/src/data-source.js
  else
    echo "⚠️ data-source.js not found, skipping migrations"
  fi
fi

# Iniciar la aplicación
echo "🎯 Starting application..."
exec dumb-init node "$MAIN_FILE"