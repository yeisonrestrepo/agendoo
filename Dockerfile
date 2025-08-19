# =====================================
# Dockerfile Multi-stage para Agendoo Backend
# =====================================

# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# ---- Dependencies Stage ----
FROM base AS deps
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Instalar dependencias basado en el lock file presente
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --only=production; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---- Build Stage ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Instalar dependencias de desarrollo para el build
RUN yarn install --frozen-lockfile

# Verificar archivos antes del build
RUN echo "📁 Files before build:" && ls -la src/

# Build de la aplicación
ENV NODE_ENV=production
RUN yarn build

# Verificar archivos después del build
RUN echo "📁 Files after build:" && \
    ls -la dist/ && \
    echo "📄 Looking for main.js:" && \
    find dist/ -name "main.js" -type f

# ---- Production Stage ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copiar el usuario no-root
COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

# Crear directorio para logs y datos
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app

# Copiar dependencias de producción
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar archivos necesarios para producción
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Crear script de inicio
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "🚀 Starting Agendoo Backend..."' >> /app/start.sh && \
    echo 'echo "Environment: $NODE_ENV"' >> /app/start.sh && \
    echo 'echo "Port: $PORT"' >> /app/start.sh && \
    echo 'echo "Database Host: $DB_HOST"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Ejecutar migraciones si está habilitado' >> /app/start.sh && \
    echo 'if [ "$RUN_MIGRATIONS" = "true" ]; then' >> /app/start.sh && \
    echo '  echo "📊 Running database migrations..."' >> /app/start.sh && \
    echo '  yarn typeorm migration:run' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Iniciar la aplicación' >> /app/start.sh && \
    echo 'echo "🎯 Starting application..."' >> /app/start.sh && \
    echo 'exec dumb-init node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nestjs:nodejs /app/start.sh

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Comando de inicio
ENTRYPOINT ["/app/start.sh"]