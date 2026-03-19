import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaV31774100000000 implements MigrationInterface {
  name = 'SchemaV31774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "public"."device_platform_enum" AS ENUM('IOS', 'ANDROID', 'WEB')`);

    // ── employee_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employee_services" ADD "customPrice" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "employee_services" ADD "skill" varchar`);

    // ── reviews ──────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "reviews" ADD "verified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "flagged" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "flagReason" varchar`);

    // ── business_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_services" ADD "categoriesOverride" text`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" ADD "endDateTime" TIMESTAMP`);

    // ── categories ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "description" varchar,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── devices ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "pushToken" varchar NOT NULL UNIQUE,
        "platform" "public"."device_platform_enum" NOT NULL,
        "deviceName" varchar,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_devices_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_devices_userId" ON "devices" ("userId")`);

    // ── business_clients ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "business_clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "businessId" uuid NOT NULL,
        "clientId" uuid NOT NULL,
        "alias" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_business_clients_business_client" UNIQUE ("businessId", "clientId"),
        CONSTRAINT "FK_business_clients_business" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_business_clients_client" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── business_clients ─────────────────────────────────────────────────────
    await queryRunner.query(`DROP TABLE "business_clients"`);

    // ── devices ──────────────────────────────────────────────────────────────
    await queryRunner.query(`DROP INDEX "IDX_devices_userId"`);
    await queryRunner.query(`DROP TABLE "devices"`);

    // ── categories ───────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TABLE "categories"`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "endDateTime"`);

    // ── business_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "business_services" DROP COLUMN "categoriesOverride"`);

    // ── reviews ──────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "flagReason"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "flagged"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "verified"`);

    // ── employee_services ────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employee_services" DROP COLUMN "skill"`);
    await queryRunner.query(`ALTER TABLE "employee_services" DROP COLUMN "customPrice"`);

    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."device_platform_enum"`);
  }
}
