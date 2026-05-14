import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase4Schema1746000000003 implements MigrationInterface {
  name = 'Phase4Schema1746000000003';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      -- ─── CUSTOMERS ────────────────────────────────────────────────────────
      CREATE TABLE customers (
        id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email               VARCHAR NOT NULL UNIQUE,
        full_name           VARCHAR NOT NULL,
        phone               VARCHAR,
        password_hash       VARCHAR,
        refresh_token_hash  VARCHAR,
        email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- ─── ORDERS ───────────────────────────────────────────────────────────
      CREATE TABLE orders (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id       UUID NOT NULL REFERENCES tenants(id),
        customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
        customer_email  VARCHAR NOT NULL,
        customer_name   VARCHAR NOT NULL,
        status          VARCHAR NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','paid','failed','refunded')),
        subtotal        NUMERIC NOT NULL,
        platform_fee    NUMERIC NOT NULL,
        tenant_revenue  NUMERIC NOT NULL,
        currency        VARCHAR NOT NULL DEFAULT 'VND',
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        paid_at         TIMESTAMPTZ
      );

      CREATE TABLE order_items (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        template_id     UUID NOT NULL REFERENCES templates(id),
        template_title  VARCHAR NOT NULL,
        unit_price      NUMERIC NOT NULL
      );

      -- ─── PAYMENTS ─────────────────────────────────────────────────────────
      CREATE TABLE payments (
        id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_id          UUID NOT NULL UNIQUE REFERENCES orders(id),
        provider          VARCHAR NOT NULL,
        provider_txn_id   VARCHAR UNIQUE,
        amount            NUMERIC NOT NULL,
        currency          VARCHAR NOT NULL DEFAULT 'VND',
        status            VARCHAR NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','success','failed','refunded')),
        provider_response JSONB,
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        updated_at        TIMESTAMPTZ DEFAULT NOW()
      );

      -- ─── INVITATIONS ──────────────────────────────────────────────────────
      CREATE TABLE invitations (
        id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_item_id        UUID NOT NULL REFERENCES order_items(id),
        template_id          UUID NOT NULL REFERENCES templates(id),
        template_version_id  UUID NOT NULL REFERENCES template_versions(id),
        customer_id          UUID REFERENCES customers(id) ON DELETE SET NULL,
        customer_email       VARCHAR NOT NULL,
        access_token         UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
        public_slug          VARCHAR UNIQUE,
        is_public            BOOLEAN NOT NULL DEFAULT FALSE,
        view_count           INT NOT NULL DEFAULT 0,
        created_at           TIMESTAMPTZ DEFAULT NOW(),
        updated_at           TIMESTAMPTZ DEFAULT NOW(),
        expires_at           TIMESTAMPTZ
      );

      CREATE TABLE invitation_variables (
        id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
        variable_key  VARCHAR NOT NULL,
        value_text    TEXT,
        value_json    JSONB,
        updated_at    TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (invitation_id, variable_key)
      );

      -- indexes
      CREATE INDEX idx_orders_tenant     ON orders(tenant_id);
      CREATE INDEX idx_orders_customer   ON orders(customer_id);
      CREATE INDEX idx_invitations_token ON invitations(access_token);
      CREATE INDEX idx_invitations_slug  ON invitations(public_slug);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS invitation_variables;
      DROP TABLE IF EXISTS invitations;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS customers;
    `);
  }
}
