# =====================================
# Dockerfile para Agendoo API
# Multi-stage build optimizado para producción
# =====================================

# =====================================
# STAGE 1: Build Stage
# =====================================
FROM node:18-alpine AS builder

# Metadata del proyecto
LABEL maintainer="Yeison Restrepo <yeison.restrepo.r@gmail.com>"
LABEL project="agendoo-api"
LABEL version="1.0.0"
LABEL description="Agendoo Backend - NestJS GraphQL API"

# Instalar dependencias del sistema necesarias para build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && ln -sf python3 /usr/bin/python

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json yarn.lock ./

# Configurar yarn para builds más rápidos
RUN yarn config set network-timeout 600000 \
    && yarn config set registry https://registry.npmjs.org/

# Instalar dependencias (incluye devDependencies para build)
RUN yarn install --frozen-lockfile --production=false

# Copiar código fuente
COPY . .

# Ejecutar build de TypeScript
RUN yarn build

# Limpiar node_modules y reinstalar solo dependencias de producción
RUN rm -rf node_modules \
    && yarn install --frozen-lockfile --production=true \
    && yarn cache clean

# =====================================
# STAGE 2: Production Stage
# =====================================
FROM node:18-alpine AS production

# Instalar dependencias de runtime mínimas
RUN apk add --no-cache \
    dumb-init \
    curl \
    && addgroup -g 1001 -S agendoo \
    && adduser -S agendoo -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Cambiar ownership del directorio
RUN chown -R agendoo:agendoo /app

# Cambiar a usuario no-root
USER agendoo

# Copiar node_modules de producción desde build stage
COPY --from=builder --chown=agendoo:agendoo /app/node_modules ./node_modules

# Copiar aplicación compilada
COPY --from=builder --chown=agendoo:agendoo /app/dist ./dist

# Copiar archivos necesarios para runtime
COPY --from=builder --chown=agendoo:agendoo /app/package.json ./
COPY --from=builder --chown=agendoo:agendoo /app/yarn.lock ./

# Crear directorios para logs y uploads
RUN mkdir -p logs uploads temp

# Exponer puerto de la aplicación
EXPOSE 4000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000
ENV TZ=America/Bogota

# Health check optimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio (equivalente a npm run start:prod)
CMD ["node", "dist/main"]