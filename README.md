# 📱 Agendoo Backend - Fase 1 (MVP Core)

> Backend para plataforma de reservas de barberos construido con NestJS, PostgreSQL 15 y GraphQL

## 🎯 ¿Qué es Agendoo?

**Agendoo** es una plataforma que conecta barberos y barbershops con clientes a través de aplicaciones móviles React Native. Los clientes pueden encontrar barberos cercanos, ver sus servicios, hacer reservas y pagar de forma segura.

### 🏗️ Fase 1 - MVP Core (Lo que tenemos ahora)

En esta primera fase hemos construido las funcionalidades esenciales:

#### ✅ **Sistema de Autenticación Completo**
- 🔐 Login/Registro tradicional con email y contraseña
- 🌐 Autenticación OAuth con Google, Facebook y Apple ID
- 🔑 JWT tokens para sesiones seguras
- 👥 Roles diferenciados: Cliente, Barbero, Administrador

#### ✅ **Gestión de Usuarios**
- 👤 Perfiles personalizables con foto, teléfono, dirección
- 📍 Geolocalización para ubicar barberos cercanos
- ⚡ Onboarding diferenciado según tipo de usuario

#### ✅ **Sistema de Barberos**
- 🏪 Perfiles de negocio con información detallada
- ✂️ Catálogo de servicios (cortes, precios, duración)
- ⭐ Sistema básico de calificaciones
- 📍 Búsqueda geoespacial por proximidad

#### ✅ **Sistema de Reservas**
- 📅 Crear reservas con fecha/hora específica
- 🔄 Estados de reserva (Pendiente, Confirmada, Cancelada, Completada)
- 📝 Notas adicionales para el barbero
- 📋 Historial de reservas para clientes y barberos

#### ✅ **API GraphQL Robusta**
- 🔍 Queries optimizadas para evitar N+1 queries
- 🛡️ Validación y sanitización de inputs
- 📊 Esquema auto-documentado
- 🎮 GraphQL Playground para testing

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 10.x | Framework backend modular |
| **GraphQL** | 16.x | API query language |
| **TypeORM** | 0.3.x | ORM para base de datos |
| **PostgreSQL** | 15 | Base de datos principal |
| **PostGIS** | Latest | Extensión para geolocalización |
| **Redis** | 7.x | Cache y sesiones |
| **JWT** | Latest | Autenticación stateless |
| **Passport** | Latest | Estrategias de autenticación |
| **Bcrypt** | Latest | Hashing de contraseñas |

## 🚀 Instalación y Setup

### Requisitos Previos
- **Node.js 18+** 
- **Yarn 1.22+** 
- **Docker & Docker Compose** (para desarrollo)
- **PostgreSQL 15** (opcional si usas Docker)

### 1. **Instalación de Dependencias**
```bash
# Instalar TODAS las dependencias necesarias
yarn install

# Verificar instalación
yarn install --check-files
```

### 2. **Configurar Base de Datos (PostgreSQL 15)**
```bash
# Iniciar PostgreSQL 15 con Docker
docker-compose up -d postgres redis

# Verificar que está funcionando
docker ps

# Ver logs si hay problemas
docker-compose logs postgres
```

### 3. **Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus configuraciones
nano .env  # o tu editor preferido
```

### 4. **Inicializar Base de Datos**
```bash
# Ejecutar migraciones
yarn migration:run

# Verificar que se aplicaron correctamente
yarn typeorm migration:show
```

### 5. **Iniciar Servidor de Desarrollo**
```bash
# Iniciar con hot reload
yarn start:dev

# Deberías ver:
# 🚀 Server running on http://localhost:4000/graphql
```