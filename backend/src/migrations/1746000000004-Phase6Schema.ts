import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase6Schema1746000000004 implements MigrationInterface {
  name = 'Phase6Schema1746000000004';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE tenant_ai_configs (
        id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        feature      VARCHAR NOT NULL CHECK (feature IN ('template_gen','image_gen','variable_extract')),
        provider     VARCHAR NOT NULL CHECK (provider IN ('anthropic','openai','google','stability')),
        model        VARCHAR NOT NULL,
        api_key_enc  TEXT NOT NULL,
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (tenant_id, feature, provider)
      );

      CREATE TABLE ai_generation_logs (
        id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id       UUID NOT NULL REFERENCES users(id),
        config_id     UUID REFERENCES tenant_ai_configs(id) ON DELETE SET NULL,
        feature       VARCHAR NOT NULL,
        prompt        TEXT NOT NULL,
        provider      VARCHAR NOT NULL,
        model         VARCHAR NOT NULL,
        tokens_input  INT NOT NULL DEFAULT 0,
        tokens_output INT NOT NULL DEFAULT 0,
        cost_usd      NUMERIC NOT NULL DEFAULT 0,
        status        VARCHAR NOT NULL CHECK (status IN ('success','failed','rejected')),
        result_id     VARCHAR,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX idx_ai_logs_tenant ON ai_generation_logs(tenant_id);
      CREATE INDEX idx_ai_logs_user   ON ai_generation_logs(user_id);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS ai_generation_logs;
      DROP TABLE IF EXISTS tenant_ai_configs;
    `);
  }
}
