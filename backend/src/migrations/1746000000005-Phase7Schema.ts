import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase7Schema1746000000005 implements MigrationInterface {
  name = 'Phase7Schema1746000000005';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE payouts (
        id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        period_start       DATE NOT NULL,
        period_end         DATE NOT NULL,
        total_revenue      NUMERIC NOT NULL DEFAULT 0,
        platform_fee_total NUMERIC NOT NULL DEFAULT 0,
        payout_amount      NUMERIC NOT NULL DEFAULT 0,
        status             VARCHAR NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','processing','paid')),
        note               TEXT,
        processed_at       TIMESTAMPTZ,
        paid_at            TIMESTAMPTZ,
        created_at         TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE payout_items (
        id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        payout_id       UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
        order_id        UUID NOT NULL UNIQUE REFERENCES orders(id),
        tenant_revenue  NUMERIC NOT NULL DEFAULT 0,
        platform_fee    NUMERIC NOT NULL DEFAULT 0,
        order_paid_at   TIMESTAMPTZ
      );

      CREATE INDEX idx_payouts_tenant  ON payouts(tenant_id);
      CREATE INDEX idx_payouts_status  ON payouts(status);
      CREATE INDEX idx_payout_items_payout ON payout_items(payout_id);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS payout_items;
      DROP TABLE IF EXISTS payouts;
    `);
  }
}
