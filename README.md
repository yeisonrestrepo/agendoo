# 💄 Agendoo - Plataforma de Servicios de Belleza

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat&logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat&logo=postgresql)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat)
![Commercial](https://img.shields.io/badge/Commercial-License%20Required-orange?style=flat)

> 🚀 **Conectando profesionales de la belleza con clientes a través de tecnología de vanguardia**

Agendoo es una plataforma integral que revoluciona la forma en que los clientes descubren y reservan servicios de belleza. Conectamos a una amplia gama de profesionales del sector con clientes que buscan experiencias excepcionales, todo a través de nuestras aplicaciones móviles intuitivas y un backend robusto.

## 🌟 ¿Qué es Agendoo?

Nuestra plataforma ha evolucionado desde sus inicios enfocados únicamente en barbería, para convertirse en un ecosistema completo que abarca todo el mundo de la belleza y el bienestar personal.

### 👥 Tipos de Profesionales
- 💇‍♂️ **Barberos** - Cortes tradicionales y modernos
- 💅 **Nail Artists** - Manicure, pedicure y nail art
- 💄 **Makeup Artists** - Maquillaje profesional y eventos
- ✂️ **Estilistas** - Cortes, peinados y tratamientos capilares
- 🏢 **Salones de Belleza** - Servicios integrales
- 🧘‍♀️ **Spas** - Relajación y tratamientos corporales
- 🧴 **Especialistas en Cuidado de Piel** - Tratamientos faciales y dermatológicos

## 🏗️ Arquitectura Técnica

### Backend (Nest.js + GraphQL)
```
📦 Backend Stack
├── 🚀 Nest.js - Framework principal
├── 🗃️ PostgreSQL 15 - Base de datos
├── 🔗 GraphQL - API layer
├── 🔐 JWT Auth - Autenticación segura
├── 📍 Geolocation Services - Búsqueda por ubicación
└── 💳 Payment Integration - Procesamiento de pagos
```

### Aplicaciones Móviles
```
📱 Mobile Apps (React Native)
├── 👤 Cliente App - Descubrir y reservar servicios
└── 💼 Professional App - Gestionar agenda y servicios
```

## 🎯 Características Principales

### Para Clientes
- 🔍 **Búsqueda Inteligente** - Encuentra profesionales por ubicación, servicios y valoraciones
- 📅 **Reservas en Tiempo Real** - Sistema de booking instantáneo
- 💸 **Pagos Seguros** - Múltiples métodos de pago integrados
- ⭐ **Sistema de Valoraciones** - Reviews y ratings transparentes
- 🔔 **Notificaciones** - Recordatorios y actualizaciones en tiempo real

### Para Profesionales
- 📊 **Dashboard Completo** - Gestión de agenda, servicios y finanzas
- ✅ **Verificación Profesional** - Proceso de validación de credenciales
- 💰 **Gestión de Ingresos** - Seguimiento de ganancias y comisiones
- 📈 **Analytics** - Métricas de rendimiento y crecimiento
- 🛠️ **Personalización** - Configuración de servicios, precios y disponibilidad

## 🔧 Stack Tecnológico

### Backend
- **Framework**: Nest.js con TypeScript
- **Base de Datos**: PostgreSQL 15 con optimizaciones geoespaciales
- **API**: GraphQL con resolvers optimizados
- **Autenticación**: JWT con refresh tokens
- **Cache**: Redis para datos frecuentes
- **Files**: AWS S3 para almacenamiento multimedia
- **Payments**: Stripe/PayPal integration
- **Real-time**: WebSocket subscriptions

### Mobile
- **Framework**: React Native
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **Maps**: Google Maps API
- **Push Notifications**: Firebase Cloud Messaging

### DevOps & Infrastructure
- **Containerización**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logs**: ELK Stack
- **Deploy**: AWS ECS/EKS

## 📊 Arquitectura de la Base de Datos

### Esquema Principal
```sql
-- Usuarios unificados con roles simplificados
Users (id, email, role: CLIENT | PROFESSIONAL | ADMIN)

-- Profesionales con tipos específicos
Professionals (
  user_id, 
  type: BARBER | NAIL_ARTIST | MAKEUP_ARTIST | HAIR_STYLIST | BEAUTY_SALON | SPA | SKINCARE_SPECIALIST,
  verified_at,
  location,
  rating
)

-- Servicios flexibles por profesional
Services (id, professional_id, name, duration, price, category)

-- Sistema de reservas robusto
Bookings (id, client_id, professional_id, service_id, date, status, payment_status)
```

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15

### Setup Rápido
```bash
# Clonar el repositorio
git clone https://github.com/tu-org/agendoo-backend.git
cd agendoo-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Levantar servicios con Docker
docker-compose up -d

# Ejecutar migraciones
npm run migration:run

# Iniciar en modo desarrollo
npm run start:dev
```

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://user:password@localhost:5432/agendoo
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=your-aws-key
GOOGLE_MAPS_API_KEY=your-maps-key
```

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev        # Servidor con hot reload
npm run start:debug      # Modo debug

# Testing
npm run test            # Unit tests
npm run test:e2e        # Integration tests
npm run test:cov        # Coverage report

# Producción
npm run build           # Build optimizado
npm run start:prod      # Servidor producción

# Base de datos
npm run migration:create  # Crear migración
npm run migration:run     # Ejecutar migraciones
npm run seed             # Poblar datos iniciales
```

## 🧪 Testing

Nuestro enfoque de testing cubre múltiples niveles:

```bash
# Tests unitarios con cobertura >80%
npm run test

# Tests de integración con base de datos en memoria
npm run test:e2e

# Tests de carga para endpoints críticos
npm run test:load
```

## 📈 Evolución del Proyecto

### ✅ Changelog Reciente

**🔄 Migración de Roles Simplificada**
- **Antes**: `UserRole.BARBER` específico solo para barberos
- **Después**: `UserRole.PROFESSIONAL` unificado para todos los profesionales
- **Beneficio**: Mayor escalabilidad y simplicidad en la gestión de permisos

**🎨 Nueva Arquitectura de Profesionales**
- Separación clara entre rol de usuario y tipo de profesional
- Fácil extensión para nuevos tipos de servicios
- Lógica de permisos uniforme y consistente

## 🔒 Seguridad

### Medidas Implementadas
- 🔐 **Autenticación JWT** con refresh tokens
- 🛡️ **Validación de entrada** exhaustiva en todos los endpoints
- 🚫 **Rate Limiting** para prevenir abuso de API
- 🔒 **Encriptación** de datos sensibles en base de datos
- 🏥 **Cumplimiento OWASP** en diseño de API
- 💳 **PCI DSS** compliance para procesamiento de pagos

## 📄 Licencia

Este proyecto es **software propietario** y requiere una **licencia comercial** para su uso. 

Para más información sobre licenciamiento, contacta a nuestro equipo comercial.

## 🤝 Contribución

Este es un proyecto privado. Para contribuciones internas, consulta nuestra [guía de contribución](CONTRIBUTING.md) y [estándares de código](CODE_STANDARDS.md).

## 📞 Soporte

- 📧 **Tech Support**: tech@agendoo.com
- 💼 **Business**: business@agendoo.com
- 🐛 **Bug Reports**: Usar el sistema interno de tickets

---

<div align="center">

**🚀 Desarrollado con ❤️ por el equipo de Agendoo**

*Transformando la industria de la belleza, una reserva a la vez*

</div>