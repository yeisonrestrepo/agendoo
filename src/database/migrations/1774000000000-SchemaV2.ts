import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaV21774000000000 implements MigrationInterface {
  name = 'SchemaV21774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "public"."booking_origin_enum" AS ENUM('APP_CLIENT', 'MANUAL')`);
    await queryRunner.query(`CREATE TYPE "public"."service_audience_enum" AS ENUM('ALL', 'MALE', 'FEMALE', 'KIDS')`);

    // ── businesses ───────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "businesses" ADD "isSingleMember" boolean NOT NULL DEFAULT false`);

    // ── business_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_services" ADD "originalPrice" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "business_services" ADD "sortOrder" integer NOT NULL DEFAULT 0`);

    // ── employees ────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employees" ADD "isGeneric" boolean NOT NULL DEFAULT false`);

    // ── business_hours ───────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_hours" ADD "breaks" jsonb NOT NULL DEFAULT '[]'`);

    // ── employee_schedules ───────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employee_schedules" ADD "breaks" jsonb NOT NULL DEFAULT '[]'`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" ADD "origin" "public"."booking_origin_enum" NOT NULL DEFAULT 'APP_CLIENT'`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD "rescheduledFromId" uuid`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_rescheduledFrom" FOREIGN KEY ("rescheduledFromId") REFERENCES "bookings"("id") ON DELETE SET NULL`);

    // ── service_catalog ──────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "service_catalog" ADD "audience" "public"."service_audience_enum" NOT NULL DEFAULT 'ALL'`);
    await queryRunner.query(`ALTER TABLE "service_catalog" ADD "basePrice" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "service_catalog" ADD "originalPrice" numeric(10,2)`);

    // ── favorites ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "businessId" uuid,
        "employeeId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_favorites_user_business" UNIQUE ("userId", "businessId"),
        CONSTRAINT "UQ_favorites_user_employee" UNIQUE ("userId", "employeeId"),
        CONSTRAINT "FK_favorites_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ── saved_searches ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "saved_searches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "filters" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_saved_searches_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ── client_preferences ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "client_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE,
        "notifyBookingConfirmed" boolean NOT NULL DEFAULT true,
        "notifyBookingReminder" boolean NOT NULL DEFAULT true,
        "notifyBookingCancelled" boolean NOT NULL DEFAULT true,
        "notifyPromotions" boolean NOT NULL DEFAULT true,
        "profileVisibleToBookedBusinesses" boolean NOT NULL DEFAULT true,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_client_preferences_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Drop new tables ───────────────────────────────────────────────────────
    await queryRunner.query(`DROP TABLE "client_preferences"`);
    await queryRunner.query(`DROP TABLE "saved_searches"`);
    await queryRunner.query(`DROP TABLE "favorites"`);

    // ── service_catalog ──────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "service_catalog" DROP COLUMN "originalPrice"`);
    await queryRunner.query(`ALTER TABLE "service_catalog" DROP COLUMN "basePrice"`);
    await queryRunner.query(`ALTER TABLE "service_catalog" DROP COLUMN "audience"`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_rescheduledFrom"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "rescheduledFromId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "origin"`);

    // ── employee_schedules ───────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employee_schedules" DROP COLUMN "breaks"`);

    // ── business_hours ───────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_hours" DROP COLUMN "breaks"`);

    // ── employees ────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "isGeneric"`);

    // ── business_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_services" DROP COLUMN "sortOrder"`);
    await queryRunner.query(`ALTER TABLE "business_services" DROP COLUMN "originalPrice"`);

    // ── businesses ───────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN "isSingleMember"`);

    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."service_audience_enum"`);
    await queryRunner.query(`DROP TYPE "public"."booking_origin_enum"`);
  }
}
