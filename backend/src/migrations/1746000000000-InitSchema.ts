import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1746000000000 implements MigrationInterface {
  name = 'InitSchema1746000000000';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- ─── IAM ───────────────────────────────────────────────────────────────
      CREATE TABLE users (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email            VARCHAR NOT NULL UNIQUE,
        password_hash    VARCHAR NOT NULL,
        full_name        VARCHAR NOT NULL,
        avatar_url       VARCHAR,
        refresh_token_hash VARCHAR,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE tenants (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name             VARCHAR NOT NULL,
        slug             VARCHAR NOT NULL UNIQUE,
        logo_url         VARCHAR,
        primary_color    VARCHAR,
        description      TEXT,
        commission_rate  NUMERIC DEFAULT 10,
        payout_info      JSONB,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE tenant_members (
        id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role       VARCHAR NOT NULL CHECK (role IN ('owner','admin','editor')),
        joined_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (tenant_id, user_id)
      );

      -- ─── SUBSCRIPTION ──────────────────────────────────────────────────────
      CREATE TABLE subscription_plans (
        id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name                 VARCHAR NOT NULL,
        price_monthly        NUMERIC NOT NULL DEFAULT 0,
        price_yearly         NUMERIC NOT NULL DEFAULT 0,
        max_templates        INT,
        max_members          INT,
        custom_domain        BOOLEAN DEFAULT FALSE,
        analytics            BOOLEAN DEFAULT FALSE,
        marketplace_listing  BOOLEAN DEFAULT FALSE,
        ai_byok              BOOLEAN DEFAULT FALSE,
        is_active            BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE subscriptions (
        id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        plan_id               UUID NOT NULL REFERENCES subscription_plans(id),
        status                VARCHAR NOT NULL DEFAULT 'active',
        current_period_start  TIMESTAMPTZ NOT NULL,
        current_period_end    TIMESTAMPTZ NOT NULL,
        cancel_at_period_end  BOOLEAN DEFAULT FALSE,
        provider              VARCHAR NOT NULL,
        provider_sub_id       VARCHAR
      );

      CREATE TABLE subscription_events (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        subscription_id  UUID REFERENCES subscriptions(id),
        tenant_id        UUID NOT NULL REFERENCES tenants(id),
        event_type       VARCHAR NOT NULL,
        from_plan_id     UUID REFERENCES subscription_plans(id),
        to_plan_id       UUID REFERENCES subscription_plans(id),
        amount_paid      NUMERIC,
        currency         VARCHAR,
        provider         VARCHAR,
        provider_txn_id  VARCHAR,
        period_start     TIMESTAMPTZ,
        period_end       TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );

      -- ─── STOREFRONT ────────────────────────────────────────────────────────
      CREATE TABLE storefronts (
        id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id        UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
        custom_domain    VARCHAR,
        domain_verified  BOOLEAN DEFAULT FALSE,
        banner_url       VARCHAR,
        welcome_text     TEXT,
        seo_title        VARCHAR,
        seo_description  VARCHAR,
        theme_color      VARCHAR,
        social_links     JSONB,
        is_active        BOOLEAN DEFAULT TRUE
      );
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS storefronts;
      DROP TABLE IF EXISTS subscription_events;
      DROP TABLE IF EXISTS subscriptions;
      DROP TABLE IF EXISTS subscription_plans;
      DROP TABLE IF EXISTS tenant_members;
      DROP TABLE IF EXISTS tenants;
      DROP TABLE IF EXISTS users;
    `);
  }
}
