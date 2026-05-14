import { MigrationInterface, QueryRunner } from 'typeorm';

export class TemplateStatusPrivatePublished1746000000010
  implements MigrationInterface
{
  name = 'TemplateStatusPrivatePublished1746000000010';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE templates
        DROP CONSTRAINT IF EXISTS templates_status_check;
    `);

    await qr.query(`
      UPDATE templates
      SET status = 'private'
      WHERE status IN ('draft', 'archived');
    `);

    await qr.query(`
      ALTER TABLE templates
        ALTER COLUMN status SET DEFAULT 'private';
    `);

    await qr.query(`
      ALTER TABLE templates
        ADD CONSTRAINT templates_status_check
        CHECK (status IN ('private', 'published'));
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE templates
        DROP CONSTRAINT IF EXISTS templates_status_check;
    `);

    await qr.query(`
      UPDATE templates
      SET status = 'draft'
      WHERE status = 'private';
    `);

    await qr.query(`
      ALTER TABLE templates
        ALTER COLUMN status SET DEFAULT 'draft';
    `);

    await qr.query(`
      ALTER TABLE templates
        ADD CONSTRAINT templates_status_check
        CHECK (status IN ('draft', 'published', 'archived'));
    `);
  }
}
