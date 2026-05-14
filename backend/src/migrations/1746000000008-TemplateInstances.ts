import { MigrationInterface, QueryRunner } from 'typeorm';

export class TemplateInstances1746000000008 implements MigrationInterface {
  name = 'TemplateInstances1746000000008';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS template_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_template_id UUID NOT NULL,
        source_template_version_id UUID,
        canvas_data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT fk_template_instances_template
          FOREIGN KEY (source_template_id) REFERENCES templates(id) ON DELETE RESTRICT,
        CONSTRAINT fk_template_instances_template_version
          FOREIGN KEY (source_template_version_id) REFERENCES template_versions(id) ON DELETE SET NULL
      );
    `);

    await qr.query(`
      ALTER TABLE invitations
        ADD COLUMN IF NOT EXISTS template_instance_id UUID;
    `);

    await qr.query(`
      ALTER TABLE invitations
        ADD CONSTRAINT fk_invitations_template_instance
        FOREIGN KEY (template_instance_id) REFERENCES template_instances(id) ON DELETE SET NULL;
    `);

    await qr.query(`
      CREATE TEMP TABLE tmp_invitation_template_instances (
        invitation_id UUID PRIMARY KEY,
        template_instance_id UUID NOT NULL,
        source_template_id UUID NOT NULL,
        source_template_version_id UUID,
        canvas_data JSONB NOT NULL
      ) ON COMMIT DROP;
    `);

    await qr.query(`
      INSERT INTO tmp_invitation_template_instances (
        invitation_id,
        template_instance_id,
        source_template_id,
        source_template_version_id,
        canvas_data
      )
      SELECT
        inv.id,
        gen_random_uuid(),
        inv.template_id,
        inv.template_version_id,
        tv.canvas_data
      FROM invitations inv
      INNER JOIN template_versions tv ON tv.id = inv.template_version_id
      WHERE inv.template_instance_id IS NULL;
    `);

    await qr.query(`
      INSERT INTO template_instances (
        id,
        source_template_id,
        source_template_version_id,
        canvas_data,
        created_at,
        updated_at
      )
      SELECT
        template_instance_id,
        source_template_id,
        source_template_version_id,
        canvas_data,
        now(),
        now()
      FROM tmp_invitation_template_instances;
    `);

    await qr.query(`
      UPDATE invitations inv
      SET template_instance_id = tmp.template_instance_id
      FROM tmp_invitation_template_instances tmp
      WHERE inv.id = tmp.invitation_id;
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_template_instances_source_template_id
        ON template_instances(source_template_id);
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS idx_invitations_template_instance_id
        ON invitations(template_instance_id);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP INDEX IF EXISTS idx_invitations_template_instance_id;
    `);
    await qr.query(`
      DROP INDEX IF EXISTS idx_template_instances_source_template_id;
    `);
    await qr.query(`
      ALTER TABLE invitations
        DROP CONSTRAINT IF EXISTS fk_invitations_template_instance;
    `);
    await qr.query(`
      ALTER TABLE invitations
        DROP COLUMN IF EXISTS template_instance_id;
    `);
    await qr.query(`
      DROP TABLE IF EXISTS template_instances;
    `);
  }
}
