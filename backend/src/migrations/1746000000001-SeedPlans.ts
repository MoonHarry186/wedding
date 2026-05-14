import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPlans1746000000001 implements MigrationInterface {
  name = 'SeedPlans1746000000001';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      INSERT INTO subscription_plans
        (name, price_monthly, price_yearly, max_templates, max_members, custom_domain, analytics, marketplace_listing, ai_byok, is_active)
      VALUES
        ('Free',       0,      0,    3,    1, FALSE, FALSE, FALSE, FALSE, TRUE),
        ('Pro',      199000, 1990000, 20,   3, FALSE, TRUE,  TRUE,  FALSE, TRUE),
        ('Business', 499000, 4990000, NULL, 10, TRUE, TRUE,  TRUE,  TRUE,  TRUE),
        ('Enterprise', 999000, 9990000, NULL, NULL, TRUE, TRUE, TRUE, TRUE, TRUE);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(
      `DELETE FROM subscription_plans WHERE name IN ('Free','Pro','Business','Enterprise')`,
    );
  }
}
