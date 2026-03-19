import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaV51774300000000 implements MigrationInterface {
  name = 'SchemaV51774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE "public"."gender_enum" AS ENUM('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY')`);

    // ── profiles ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "profiles" ADD "gender" "public"."gender_enum"`);

    // ── users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`);

    // ── businesses ───────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "businesses" ADD "active" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── businesses ───────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN "active"`);

    // ── users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);

    // ── profiles ─────────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "gender"`);

    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."gender_enum"`);
  }
}
