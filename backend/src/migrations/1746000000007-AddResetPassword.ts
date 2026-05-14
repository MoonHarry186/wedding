import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPassword1746000000007 implements MigrationInterface {
  async up(runner: QueryRunner) {
    await runner.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR,
        ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ
    `);
  }

  async down(runner: QueryRunner) {
    await runner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS reset_password_token,
        DROP COLUMN IF EXISTS reset_password_expires
    `);
  }
}
