# Agendoo API

A beauty services booking platform API built with NestJS, GraphQL (Apollo), TypeORM, and PostgreSQL.

## Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **API**: GraphQL (Apollo, code-first) — schema auto-generated at `src/schema.gql`
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 15 + PostGIS
- **Auth**: JWT + OAuth (Google, Facebook)
- **Email**: Nodemailer (SMTP)

---

## Prerequisites

- Node.js 20+
- Yarn
- Docker + Docker Compose (for local PostgreSQL)

---

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. See [Environment Variables](#environment-variables) for the full list.

### 3. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL on port **5433** (mapped from container port 5432).

### 4. Run migrations

```bash
yarn migration:run
```

### 5. Start the dev server

```bash
yarn start:dev
```

The API will be available at `http://localhost:4000/graphql`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_HOST` | Yes | — | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | — | Database user |
| `DB_PASSWORD` | Yes | — | Database password |
| `DB_NAME` | Yes | — | Database name |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | `1d` | Access token TTL |
| `GOOGLE_CLIENT_ID` | Yes* | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | — | Google OAuth client secret |
| `FACEBOOK_APP_ID` | Yes* | — | Facebook App ID |
| `FACEBOOK_APP_SECRET` | Yes* | — | Facebook App secret |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_SECURE` | No | `false` | Use TLS (`true` for port 465) |
| `SMTP_USER` | No | — | SMTP authentication user |
| `SMTP_PASS` | No | — | SMTP authentication password |
| `SMTP_FROM` | No | `noreply@agendoo.com` | Sender address for transactional emails |
| `NODE_ENV` | No | `development` | Node environment |
| `PORT` | No | `4000` | HTTP server port |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend origin (CORS) |
| `APP_URL` | No | `http://localhost:3000` | Frontend base URL (email links) |

*Required when the corresponding OAuth flow is used.

---

## Docker

This project shares the PostgreSQL instance. TheDocker network and the database container must exist before starting Agendoo.

```bash
# 1. Start Agendoo (db-init creates the agendoo database, migrate runs migrations, then api starts)
docker compose up -d

# Stop
docker compose down

# Rebuild API image
docker compose up -d --build
```

Exposed ports:
- **API**: `http://localhost:4000`
- **PostgreSQL** (shared): `localhost:5432`

---

## Database

```bash
# Generate migration from entity changes (requires a prior build)
yarn migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
yarn migration:run

# Rollback last migration
yarn migration:revert

# Drop entire schema (destructive)
yarn db:drop

# Seed initial data
yarn db:seed
```

---

## GraphQL Playground

Available at `http://localhost:4000/graphql` in development.

Authenticated requests must include the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

---

## Authentication

### Email / Password

```graphql
mutation Register {
  register(input: { email: "user@example.com", password: "secret123", name: "Jane", role: CLIENT }) {
    accessToken
    refreshToken
    requiresOnboarding
    user { id email role }
  }
}

mutation Login {
  login(input: { email: "user@example.com", password: "secret123" }) {
    accessToken
    refreshToken
    user { id email role }
  }
}
```

### Google OAuth

The client obtains a Google ID token via the Google Sign-In SDK and passes it to the API:

```graphql
mutation LoginWithGoogle {
  loginWithGoogle(input: { token: "<google-id-token>", userType: CLIENT }) {
    accessToken
    refreshToken
    requiresOnboarding
    user { id email }
  }
}
```

`userType` is optional and defaults to `CLIENT`. Pass `BUSINESS_OWNER` when registering a business account.

### Facebook OAuth

The client obtains a Facebook user access token and passes it to the API:

```graphql
mutation LoginWithFacebook {
  loginWithFacebook(input: { token: "<facebook-access-token>", userType: CLIENT }) {
    accessToken
    refreshToken
    requiresOnboarding
    user { id email }
  }
}
```

### Token Management

```graphql
mutation RefreshToken {
  refreshToken(token: "<refreshToken>") {
    accessToken
    refreshToken
  }
}

mutation VerifyEmail {
  verifyEmail(token: "<emailVerificationToken>")
}

# Requires auth
mutation ResendVerification {
  resendVerificationEmail
}
```

---

## REST Endpoints

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Full health check (DB connectivity, uptime, memory) |
| `GET` | `/health/ping` | Liveness probe — returns `{ status: "ok" }` |
| `GET` | `/health/version` | App version and environment |
| `GET` | `/health/simple` | Minimal liveness — returns `OK` (plain text) |

---

## GraphQL API Reference

### Auth

| Operation | Type | Auth | Description |
|---|---|---|---|
| `register(input)` | Mutation | — | Register with email/password |
| `login(input)` | Mutation | — | Login with email/password |
| `loginWithGoogle(input)` | Mutation | — | OAuth login via Google ID token |
| `loginWithFacebook(input)` | Mutation | — | OAuth login via Facebook access token |
| `refreshToken(token)` | Mutation | — | Exchange refresh token for new token pair |
| `verifyEmail(token)` | Mutation | — | Confirm email address |
| `resendVerificationEmail` | Mutation | JWT | Re-send verification email |

**AuthResponse**: `accessToken`, `refreshToken`, `user`, `requiresOnboarding`

---

### Users

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `me` | Query | JWT | — | Get current user profile |
| `updateProfile(input)` | Mutation | JWT | — | Update name, phone, avatar, gender, etc. |
| `myFavorites` | Query | JWT | CLIENT | List saved favorite businesses |
| `addFavorite(input)` | Mutation | JWT | CLIENT | Save a business as favourite |
| `removeFavorite(businessId)` | Mutation | JWT | CLIENT | Remove a favourite |
| `mySavedSearches` | Query | JWT | CLIENT | List saved search filters |
| `saveSearch(input)` | Mutation | JWT | CLIENT | Save a search configuration |
| `deleteSavedSearch(id)` | Mutation | JWT | CLIENT | Remove a saved search |
| `myPreferences` | Query | JWT | CLIENT | Get client booking preferences |
| `updatePreferences(input)` | Mutation | JWT | CLIENT | Update booking preferences |
| `setUserActive(userId, active)` | Mutation | JWT | ADMIN | Suspend or reactivate a user account |

**Gender values**: `MALE`, `FEMALE`, `NON_BINARY`, `PREFER_NOT_TO_SAY`

---

### Health (GraphQL)

| Operation | Type | Description |
|---|---|---|
| `health` | Query | Full system health object |
| `ping` | Query | Returns `"pong"` |
| `version` | Query | App version string |
| `databaseHealth` | Query | DB connection status |
| `timestamp` | Query | Current server timestamp |
| `environment` | Query | Current Node environment |

---

### Businesses

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getMyBusiness` | Query | JWT | BUSINESS_OWNER | Get authenticated owner's business |
| `getBusinesses(filters?)` | Query | — | — | List active businesses (with optional filters) |
| `getBusinessesByType(type)` | Query | — | — | Filter businesses by type |
| `getBusiness(id)` | Query | — | — | Get business by ID |
| `getBusinessServices(businessId)` | Query | — | — | List services for a business |
| `getBusinessServicesByCategory(businessId, category)` | Query | — | — | Filter services by category |
| `getBarbers` | Query | — | — | Shortcut for `BusinessType.BARBER` |
| `getNailArtists` | Query | — | — | Shortcut for `BusinessType.NAIL_ARTIST` |
| `getMakeupArtists` | Query | — | — | Shortcut for `BusinessType.MAKEUP_ARTIST` |
| `getBeautySalons` | Query | — | — | Shortcut for `BusinessType.BEAUTY_SALON` |
| `createBusiness(input)` | Mutation | JWT | BUSINESS_OWNER | Create business profile |
| `updateBusiness(input)` | Mutation | JWT | BUSINESS_OWNER | Update business profile |
| `createBusinessService(input)` | Mutation | JWT | BUSINESS_OWNER | Add a service to the business |
| `setBusinessActive(businessId, active)` | Mutation | JWT | ADMIN | Activate or deactivate a business listing |

**BusinessFiltersInput** fields: `types`, `city`, `serviceModality`, `lat`, `lng`, `radius`, `minPrice`, `maxPrice`, `serviceCategories`, `amenityIds`, `minRating`, `verifiedOnly`, `instantBookingOnly`, `limit`, `offset`

**BusinessType values**: `BARBER`, `NAIL_ARTIST`, `MAKEUP_ARTIST`, `HAIR_STYLIST`, `BEAUTY_SALON`, `BARBERSHOP`, `NAIL_SALON`, `SPA`, `LASH_ARTIST`, `BROW_ARTIST`, `SKINCARE_SPECIALIST`, `MASSAGE_THERAPIST`

**ServiceModality values**: `PHYSICAL`, `HOME_SERVICE`, `BOTH`

---

### Employees

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getEmployees(businessId)` | Query | — | — | List active employees for a business |
| `getEmployee(id)` | Query | — | — | Get employee by ID |
| `getEmployeeServices(employeeId)` | Query | — | — | List services assigned to an employee |
| `addEmployee(input)` | Mutation | JWT | BUSINESS_OWNER | Add an employee to the business |
| `updateEmployee(employeeId, input)` | Mutation | JWT | BUSINESS_OWNER | Update employee details |
| `removeEmployee(employeeId)` | Mutation | JWT | BUSINESS_OWNER | Deactivate an employee |
| `assignEmployeeService(employeeId, input)` | Mutation | JWT | BUSINESS_OWNER | Assign a service to an employee |
| `removeEmployeeService(employeeServiceId)` | Mutation | JWT | BUSINESS_OWNER | Remove a service from an employee |

**Employee fields**: `name`, `specialties`, `fotoUrl`, `tags`, `categories`, `isGeneric`, `active`

**EmployeeService fields**: `duration`, `customDuration`, `customPrice`, `skill`

---

### Bookings

| Operation | Type | Auth | Description |
|---|---|---|---|
| `createBooking(input)` | Mutation | JWT | Create a booking |
| `getBooking(bookingId)` | Query | JWT | Get booking by ID |
| `getMyBookings` | Query | JWT | Get bookings for current user (client or business owner) |
| `updateBookingStatus(bookingId, status, reason?, actorType?)` | Mutation | JWT | Transition booking status |
| `getBookingHistory(bookingId)` | Query | JWT | Get status change history for a booking |

**BookingStatus values**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`

**BookingOrigin values**: `ONLINE`, `MANUAL`

**ActorType values**: `SYSTEM`, `CLIENT`, `EMPLOYEE`, `BUSINESS`

**Booking fields**: `dateTime`, `endDateTime`, `status`, `origin`, `notes`, `cancelReason`, `rescheduledFromId`

---

### Reviews

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getReviewsByBusiness(businessId)` | Query | — | — | List reviews for a business |
| `getReview(id)` | Query | — | — | Get review by ID |
| `getMyReviews` | Query | JWT | CLIENT | Get current user's reviews |
| `canReview(bookingId)` | Query | JWT | CLIENT | Check eligibility to review a booking |
| `createReview(input)` | Mutation | JWT | CLIENT | Submit a review (sets `verified: true`) |
| `updateReview(reviewId, input)` | Mutation | JWT | CLIENT | Edit own review |
| `deleteReview(reviewId)` | Mutation | JWT | CLIENT | Delete own review |
| `flagReview(reviewId, reason)` | Mutation | JWT | — | Flag a review for moderation |
| `unflagReview(reviewId)` | Mutation | JWT | ADMIN | Clear a review flag |

**Review fields**: `rating`, `comment`, `verified`, `flagged`, `flagReason`

---

### Availability

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getAvailableSlots(businessId, date, serviceId?, employeeId?)` | Query | — | — | Get available time slots for a date |
| `getBusinessHours(businessId)` | Query | — | — | Get business weekly operating hours |
| `getEmployeeSchedule(employeeId)` | Query | — | — | Get employee weekly schedule |
| `getScheduleExceptions(businessId, from, to)` | Query | — | — | Get exceptions (closures, special hours) |
| `setBusinessHours(input)` | Mutation | JWT | BUSINESS_OWNER | Set a single day's business hours |
| `setWeeklyBusinessHours(inputs)` | Mutation | JWT | BUSINESS_OWNER | Set all days at once |
| `setEmployeeSchedule(input)` | Mutation | JWT | BUSINESS_OWNER | Set employee schedule for a day |
| `createScheduleException(input)` | Mutation | JWT | BUSINESS_OWNER | Add a closure or special hours entry |
| `deleteScheduleException(id)` | Mutation | JWT | BUSINESS_OWNER | Remove a schedule exception |

**BusinessHours / EmployeeSchedule fields**: `dayOfWeek`, `isOpen`, `openTime`, `closeTime`, `breaks` (list of `{ start, end }` time ranges)

---

### CRM

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getBusinessClients(businessId)` | Query | JWT | BUSINESS_OWNER | List clients who have booked the business |
| `getClientVisitHistory(clientId, businessId)` | Query | JWT | BUSINESS_OWNER | Get a client's booking history |
| `getClientVisitSummary(clientId, businessId)` | Query | JWT | BUSINESS_OWNER | Aggregate visit stats for a client |
| `getClientNotes(clientId, businessId)` | Query | JWT | BUSINESS_OWNER | List internal notes on a client |
| `createClientNote(input)` | Mutation | JWT | BUSINESS_OWNER | Add a note about a client |
| `updateClientNote(noteId, input)` | Mutation | JWT | BUSINESS_OWNER | Edit a client note |
| `deleteClientNote(noteId)` | Mutation | JWT | BUSINESS_OWNER | Delete a client note |
| `createManualBooking(input)` | Mutation | JWT | BUSINESS_OWNER | Create a booking on behalf of a client (`origin: MANUAL`) |
| `createCancellationPolicy(input)` | Mutation | JWT | BUSINESS_OWNER | Define a cancellation policy |
| `updateCancellationPolicy(policyId, input)` | Mutation | JWT | BUSINESS_OWNER | Update a cancellation policy |
| `deleteCancellationPolicy(policyId)` | Mutation | JWT | BUSINESS_OWNER | Remove a cancellation policy |
| `getCancellationPolicies(businessId)` | Query | JWT | — | List policies for a business |
| `checkCancellationPenalty(bookingId)` | Query | JWT | — | Determine if a penalty applies to a cancellation |
| `upsertBusinessClient(input)` | Mutation | JWT | BUSINESS_OWNER | Create or update business-client record (alias) |
| `getBusinessClientRecords(businessId)` | Query | JWT | BUSINESS_OWNER | List business-client relationship records |

---

### Media

| Operation | Type | Auth | Description |
|---|---|---|---|
| `getBusinessGallery(businessId)` | Query | — | List business photos |
| `getEmployeePortfolio(employeeId)` | Query | — | List employee portfolio items |
| `getMyMedia` | Query | JWT | Get current user's uploaded media |
| `addMedia(input)` | Mutation | JWT | Upload a media item |
| `updateMedia(mediaId, input)` | Mutation | JWT | Update media metadata |
| `deleteMedia(mediaId)` | Mutation | JWT | Delete a media item |

**MediaType values**: `WORK_SAMPLE`, `BUSINESS_PHOTO`, `BUSINESS_COVER`, `AVATAR`

**Media fields**: `url`, `type`, `mimeType`, `size`, `width`, `height`, `sortOrder`

---

### Amenities

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getAmenities` | Query | — | — | List all available amenities |
| `getAmenity(id)` | Query | — | — | Get amenity by ID |
| `getBusinessAmenities(businessId)` | Query | — | — | List amenities offered by a business |
| `createAmenity(input)` | Mutation | JWT | ADMIN | Create a platform amenity |
| `updateAmenity(amenityId, input)` | Mutation | JWT | ADMIN | Update a platform amenity |
| `addAmenityToBusiness(businessId, amenityId)` | Mutation | JWT | BUSINESS_OWNER | Add amenity to business |
| `removeAmenityFromBusiness(businessId, amenityId)` | Mutation | JWT | BUSINESS_OWNER | Remove amenity from business |

---

### Service Catalog

| Operation | Type | Auth | Role | Description |
|---|---|---|---|---|
| `getServiceCatalog` | Query | — | — | List all catalog items |
| `getServiceCatalogByCategory(category)` | Query | — | — | Filter catalog by category |
| `getServiceCatalogItem(id)` | Query | — | — | Get catalog item by ID |
| `createServiceCatalogItem(input)` | Mutation | JWT | ADMIN | Create a catalog item |
| `updateServiceCatalogItem(id, input)` | Mutation | JWT | ADMIN | Update a catalog item |
| `getCategories` | Query | — | — | List all service categories |
| `getCategory(id)` | Query | — | — | Get category by ID |
| `createCategory(input)` | Mutation | JWT | ADMIN | Create a service category |
| `updateCategory(id, input)` | Mutation | JWT | ADMIN | Update a service category |

**ServiceCategory values**: `HAIRCUT`, `HAIR_COLOR`, `MANICURE`, `PEDICURE`, `FACIAL`, `MASSAGE`, `WAXING`, `MAKEUP`, `BEARD`, `LASHES`, `NAILS`, `SPA`, `OTHER`

**ServiceCatalog fields**: `name`, `description`, `category`, `audience`, `basePrice`, `originalPrice`, `defaultDuration`

---

### Notifications / Devices

| Operation | Type | Auth | Description |
|---|---|---|---|
| `myDevices` | Query | JWT | List registered push-notification devices for current user |
| `registerDevice(input)` | Mutation | JWT | Register a device push token |
| `deregisterDevice(pushToken)` | Mutation | JWT | Remove a device push token |

**DevicePlatform values**: `IOS`, `ANDROID`, `WEB`

**Device fields**: `pushToken`, `platform`, `deviceName`, `active`

---

## User Roles

| Role | Description |
|---|---|
| `CLIENT` | End user who discovers and books services |
| `BUSINESS_OWNER` | Owns and manages a business profile and its staff |
| `EMPLOYEE` | Staff member of a business |
| `ADMIN` | Platform administrator |

---

## Architecture Notes

### Module structure

Each domain is a self-contained NestJS module: `module.ts` → `service.ts` → `resolver.ts` + `dto/` + `entities/`. GraphQL types and TypeORM entities share the same class via dual decorators (`@ObjectType()` + `@Entity()`, `@Field()` + `@Column()`).

### N+1 prevention

`DataloaderService` is REQUEST-scoped and batches related entity loads across all resolvers. It handles users, businesses, business services, employees (by ID and by business), and reviews.

### Geospatial search

Businesses support location-based filtering via PostGIS (`ST_DWithin`, `ST_Distance`). Physical businesses store coordinates in `lat`/`lng`; home-service businesses store their coverage centre in `serviceAreaLat`/`serviceAreaLng` with a `serviceRadius` (km) field.

### Transactional email

`NotificationsService` sends emails via Nodemailer SMTP for: email verification, password reset, and booking confirmation. Sending errors are logged and do not propagate to the caller.

### OAuth flow

OAuth uses a token-based approach suited for mobile clients. The mobile app handles the OAuth popup/redirect and obtains a provider token (Google ID token or Facebook user access token), then sends it to the API via `loginWithGoogle` or `loginWithFacebook`. The API verifies the token server-side before issuing JWT tokens.

### Active/inactive lifecycle

Both `User` and `Business` entities have an `active` boolean (default `true`). Suspended users cannot authenticate (JWT validation rejects inactive accounts). Inactive businesses are excluded from all public listing queries. Both flags are toggled via ADMIN-only mutations.

### Booking audit trail

Every status transition is recorded in `BookingHistory` with the new status, optional reason, and `actorType` (`SYSTEM`, `CLIENT`, `EMPLOYEE`, or `BUSINESS`). The resolver auto-infers `BUSINESS` when the caller has the `BUSINESS_OWNER` role.
