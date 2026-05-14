import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminInvitationBlankFlow1746000000011
  implements MigrationInterface
{
  name = 'AdminInvitationBlankFlow1746000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE invitations
      ALTER COLUMN template_id DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN template_id DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE template_instances
      ALTER COLUMN source_template_id DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE template_instances
      ALTER COLUMN source_template_id SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN template_id SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE invitations
      ALTER COLUMN template_id SET NOT NULL
    `);
  }
}
