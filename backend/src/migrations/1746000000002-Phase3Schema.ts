import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase3Schema1746000000002 implements MigrationInterface {
  name = 'Phase3Schema1746000000002';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      -- ─── CATALOG ──────────────────────────────────────────────────────────

      CREATE TABLE template_categories (
        id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        parent_id  UUID REFERENCES template_categories(id) ON DELETE SET NULL,
        name       VARCHAR NOT NULL,
        slug       VARCHAR NOT NULL UNIQUE,
        icon_url   VARCHAR
      );

      CREATE TABLE templates (
        id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        created_by          UUID NOT NULL REFERENCES users(id),
        category_id         UUID REFERENCES template_categories(id) ON DELETE SET NULL,
        current_version_id  UUID,
        title               VARCHAR NOT NULL,
        description         TEXT,
        thumbnail_url       VARCHAR,
        status              VARCHAR NOT NULL DEFAULT 'private'
                              CHECK (status IN ('private','published')),
        price               NUMERIC NOT NULL DEFAULT 0,
        currency            VARCHAR NOT NULL DEFAULT 'VND',
        view_count          INT NOT NULL DEFAULT 0,
        purchase_count      INT NOT NULL DEFAULT 0,
        published_at        TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE template_versions (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        template_id     UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        saved_by        UUID NOT NULL REFERENCES users(id),
        version_number  INT NOT NULL,
        canvas_data     JSONB NOT NULL,
        change_note     VARCHAR,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (template_id, version_number)
      );

      -- FK after template_versions is created
      ALTER TABLE templates
        ADD CONSTRAINT fk_templates_current_version
        FOREIGN KEY (current_version_id) REFERENCES template_versions(id)
        ON DELETE SET NULL;

      CREATE TABLE template_variables (
        id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        template_id    UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        key            VARCHAR NOT NULL,
        label          VARCHAR NOT NULL,
        type           VARCHAR NOT NULL
                         CHECK (type IN ('text','date','image','number','color')),
        required       BOOLEAN NOT NULL DEFAULT FALSE,
        default_value  TEXT,
        placeholder    VARCHAR,
        sort_order     INT NOT NULL DEFAULT 0,
        UNIQUE (template_id, key)
      );

      -- ─── MEDIA ────────────────────────────────────────────────────────────

      CREATE TABLE media_files (
        id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id      UUID REFERENCES tenants(id) ON DELETE CASCADE,
        uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
        original_name  VARCHAR NOT NULL,
        mime_type      VARCHAR NOT NULL,
        size_bytes     BIGINT NOT NULL,
        url            VARCHAR NOT NULL,
        storage_key    VARCHAR NOT NULL,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );

      -- seed default categories
      INSERT INTO template_categories (name, slug) VALUES
        ('Tiệc cưới', 'wedding'),
        ('Sinh nhật', 'birthday'),
        ('Kỷ niệm', 'anniversary'),
        ('Hội nghị', 'conference'),
        ('Khác', 'other');
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS media_files;
      DROP TABLE IF EXISTS template_variables;
      ALTER TABLE templates DROP CONSTRAINT IF EXISTS fk_templates_current_version;
      DROP TABLE IF EXISTS template_versions;
      DROP TABLE IF EXISTS templates;
      DROP TABLE IF EXISTS template_categories;
    `);
  }
}
