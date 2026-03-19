# Stage 1: Build
FROM node:20-alpine AS builder

LABEL maintainer="Yeison Restrepo <yeison.restrepo.r@gmail.com>"
LABEL project="agendoo-api"

# Native build tools required by bcrypt
RUN apk add --no-cache python3 make g++ \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn config set network-timeout 600000 \
    && yarn install --frozen-lockfile --production=false

COPY . .

RUN yarn build

# Prune to production-only dependencies
RUN rm -rf node_modules \
    && yarn install --frozen-lockfile --production=true \
    && yarn cache clean

# Stage 2: Production
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init curl \
    && addgroup -g 1001 -S agendoo \
    && adduser -S agendoo -u 1001

WORKDIR /app

RUN chown -R agendoo:agendoo /app

USER agendoo

COPY --from=builder --chown=agendoo:agendoo /app/node_modules ./node_modules
COPY --from=builder --chown=agendoo:agendoo /app/dist ./dist
COPY --from=builder --chown=agendoo:agendoo /app/package.json ./

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4000/health/simple || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
