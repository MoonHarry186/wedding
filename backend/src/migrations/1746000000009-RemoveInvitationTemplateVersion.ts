import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveInvitationTemplateVersion1746000000009
  implements MigrationInterface
{
  name = 'RemoveInvitationTemplateVersion1746000000009';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE invitations
        DROP COLUMN IF EXISTS template_version_id;
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE invitations
        ADD COLUMN IF NOT EXISTS template_version_id UUID;
    `);

    await qr.query(`
      UPDATE invitations inv
      SET template_version_id = ti.source_template_version_id
      FROM template_instances ti
      WHERE inv.template_instance_id = ti.id
        AND inv.template_version_id IS NULL;
    `);

    await qr.query(`
      ALTER TABLE invitations
        ALTER COLUMN template_version_id SET NOT NULL;
    `);

    await qr.query(`
      ALTER TABLE invitations
        ADD CONSTRAINT fk_invitations_template_version
        FOREIGN KEY (template_version_id) REFERENCES template_versions(id);
    `);
  }
}
