import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase8Schema1746000000006 implements MigrationInterface {
  name = 'Phase8Schema1746000000006';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE storefronts
        ADD COLUMN IF NOT EXISTS domain_verification_token VARCHAR;
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE storefronts DROP COLUMN IF EXISTS domain_verification_token;
    `);
  }
}
