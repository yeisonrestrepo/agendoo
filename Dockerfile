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

# Build de la aplicación
ENV NODE_ENV=production
RUN yarn build

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

# Copiar script de inicio
COPY --chown=nestjs:nodejs start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Comando de inicio
ENTRYPOINT ["/app/start.sh"]