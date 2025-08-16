#!/bin/sh
set -e

echo "🚀 Starting Agendoo Backend..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database Host: $DB_HOST"

# Ejecutar migraciones si está habilitado
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📊 Running database migrations..."
  yarn typeorm migration:run -d dist/data-source.js
fi

# Iniciar la aplicación
echo "🎯 Starting application..."
exec dumb-init node dist/main.js