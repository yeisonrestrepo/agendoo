import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaV41774200000000 implements MigrationInterface {
  name = 'SchemaV41774200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "public"."actor_type_enum" AS ENUM('SYSTEM', 'CLIENT', 'EMPLOYEE', 'BUSINESS')`);

    // ── employees ────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employees" ADD "tags" text`);
    await queryRunner.query(`ALTER TABLE "employees" ADD "categories" text`);
    await queryRunner.query(`ALTER TABLE "employees" ADD "fotoUrl" varchar`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" ADD "cancelReason" varchar`);

    // ── booking_history ──────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "booking_history" ADD "actorType" "public"."actor_type_enum" NOT NULL DEFAULT 'CLIENT'`);

    // ── media ────────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "media" ADD "width" integer`);
    await queryRunner.query(`ALTER TABLE "media" ADD "height" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── media ────────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "height"`);
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "width"`);

    // ── booking_history ──────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "booking_history" DROP COLUMN "actorType"`);

    // ── bookings ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "cancelReason"`);

    // ── employees ────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "fotoUrl"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "categories"`);
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "tags"`);

    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."actor_type_enum"`);
  }
}
