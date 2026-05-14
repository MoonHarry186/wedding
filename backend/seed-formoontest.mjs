/**
 * Seed script for formoontest@gmaill.com
 * Run: node seed-formoontest.mjs
 * Password: Test@1234
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const { Client } = pg;
const client = new Client({ host: 'localhost', port: 5432, user: 'harrymoon', password: '', database: 'zenlove' });

// ── IDs pre-generated for downstream references ──────────────────────────────
const t1Id = randomUUID(); const tv1Id = randomUUID();
const t2Id = randomUUID(); const tv2Id = randomUUID();
const t3Id = randomUUID(); const tv3Id = randomUUID();
const t4Id = randomUUID(); const tv4Id = randomUUID();

const c1Id = randomUUID();
const c2Id = randomUUID();
const c3Id = randomUUID();

const o1Id = randomUUID(); const oi1Id = randomUUID(); const p1Id = randomUUID(); const inv1Id = randomUUID();
const o2Id = randomUUID(); const oi2Id = randomUUID(); const p2Id = randomUUID(); const inv2Id = randomUUID();
const o3Id = randomUUID(); const oi3Id = randomUUID(); const p3Id = randomUUID(); const inv3Id = randomUUID();
const o4Id = randomUUID(); const oi4Id = randomUUID(); const p4Id = randomUUID();
const o5Id = randomUUID(); const oi5Id = randomUUID(); const p5Id = randomUUID();

const PRO_PLAN_ID = '459ad030-9d70-4374-8070-76af336dac6f';
const CAT_CUOI    = '4b3ecb0f-2323-4fb2-81a7-5dff4a838355';
const CAT_SINH    = '8becd372-4e40-4313-a037-63768f9ea669';
const EMAIL       = 'formoontest@gmaill.com';
const TENANT_SLUG = 'moon-studio';

async function q(sql, params = []) { return client.query(sql, params); }
async function one(sql, params = []) { return (await client.query(sql, params)).rows[0]; }

async function main() {
  await client.connect();
  console.log('✓ Connected');

  // ── 1. User ──────────────────────────────────────────────────────────────
  const pwHash = await bcrypt.hash('Test@1234', 12);
  await q(`
    INSERT INTO users (id, email, password_hash, full_name)
    VALUES (uuid_generate_v4(), $1, $2, 'Moon Tester')
    ON CONFLICT (email) DO UPDATE SET password_hash = $2
  `, [EMAIL, pwHash]);
  const { id: userId } = await one(`SELECT id FROM users WHERE email = $1`, [EMAIL]);
  console.log(`✓ User  ${userId}`);

  // ── 2. Tenant ────────────────────────────────────────────────────────────
  await q(`
    INSERT INTO tenants (id, name, slug, commission_rate)
    VALUES (uuid_generate_v4(), 'Moon Studio', $1, 10)
    ON CONFLICT (slug) DO NOTHING
  `, [TENANT_SLUG]);
  const { id: tenantId } = await one(`SELECT id FROM tenants WHERE slug = $1`, [TENANT_SLUG]);
  console.log(`✓ Tenant  ${tenantId}`);

  // ── 3. Tenant member ─────────────────────────────────────────────────────
  await q(`
    INSERT INTO tenant_members (id, tenant_id, user_id, role)
    VALUES (uuid_generate_v4(), $1, $2, 'owner')
    ON CONFLICT DO NOTHING
  `, [tenantId, userId]);
  console.log('✓ Tenant member');

  // ── 4. Storefront ────────────────────────────────────────────────────────
  await q(`
    INSERT INTO storefronts (id, tenant_id, welcome_text, seo_title, seo_description, is_active)
    VALUES (uuid_generate_v4(), $1, 'Chào mừng đến với Moon Studio', 'Moon Studio - Thiệp cưới đẹp', 'Thiết kế thiệp cưới độc đáo', true)
    ON CONFLICT DO NOTHING
  `, [tenantId]);
  console.log('✓ Storefront');

  // ── 5. Subscription ──────────────────────────────────────────────────────
  const subExists = await one(`SELECT id FROM subscriptions WHERE tenant_id = $1`, [tenantId]);
  if (!subExists) {
    await q(`
      INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, provider)
      VALUES (uuid_generate_v4(), $1, $2, 'active', NOW(), NOW() + INTERVAL '30 days', false, 'manual')
    `, [tenantId, PRO_PLAN_ID]);
  }
  console.log('✓ Subscription');

  // ── 6. Templates ─────────────────────────────────────────────────────────
  const canvasData = JSON.stringify({ width: 794, height: 1123, background: '#ffffff', elements: [] });

  const templates = [
    { id: t1Id, tvId: tv1Id, title: 'Thiệp Cưới Thanh Lịch', cat: CAT_CUOI, price: 299000, status: 'published', views: 184, sales: 0 },
    { id: t2Id, tvId: tv2Id, title: 'Hoa Hồng Vàng',         cat: CAT_CUOI, price: 349000, status: 'published', views: 97,  sales: 0 },
    { id: t3Id, tvId: tv3Id, title: 'Nhã Nhặn Tối Giản',     cat: CAT_CUOI, price: 199000, status: 'published', views: 213, sales: 0 },
    { id: t4Id, tvId: tv4Id, title: 'Sinh Nhật Vui Vẻ',      cat: CAT_SINH, price: 99000,  status: 'draft',     views: 0,   sales: 0 },
  ];

  for (const tpl of templates) {
    const existing = await one(`SELECT id FROM templates WHERE id = $1`, [tpl.id]);
    if (!existing) {
      // Insert template (no current_version_id yet)
      await q(`
        INSERT INTO templates (id, tenant_id, created_by, category_id, title, status, price, currency, view_count, purchase_count)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'VND',$8,$9)
      `, [tpl.id, tenantId, userId, tpl.cat, tpl.title, tpl.status, tpl.price, tpl.views, tpl.sales]);

      // Insert version
      await q(`
        INSERT INTO template_versions (id, template_id, saved_by, version_number, canvas_data, change_note)
        VALUES ($1,$2,$3,1,$4,'Phiên bản đầu tiên')
      `, [tpl.tvId, tpl.id, userId, canvasData]);

      // Set current version
      await q(`UPDATE templates SET current_version_id = $1 WHERE id = $2`, [tpl.tvId, tpl.id]);
    }
  }
  console.log('✓ Templates & versions');

  // ── 7. Customers ─────────────────────────────────────────────────────────
  const custRows = [
    { id: c1Id, email: 'nguyen.thu@example.com',  fullName: 'Nguyễn Thu Hà',     phone: '0901234567' },
    { id: c2Id, email: 'tran.minh@example.com',   fullName: 'Trần Minh Khoa',    phone: '0912345678' },
    { id: c3Id, email: 'le.bich@example.com',     fullName: 'Lê Thị Bích Ngọc', phone: '0923456789' },
  ];
  for (const c of custRows) {
    const ch = await bcrypt.hash('Customer@123', 10);
    await q(`
      INSERT INTO customers (id, email, full_name, phone, password_hash, email_verified)
      VALUES ($1,$2,$3,$4,$5,true) ON CONFLICT (email) DO NOTHING
    `, [c.id, c.email, c.fullName, c.phone, ch]);
  }
  // Resolve actual customer IDs in case of conflict
  const { id: ac1 } = await one(`SELECT id FROM customers WHERE email = 'nguyen.thu@example.com'`);
  const { id: ac2 } = await one(`SELECT id FROM customers WHERE email = 'tran.minh@example.com'`);
  const { id: ac3 } = await one(`SELECT id FROM customers WHERE email = 'le.bich@example.com'`);
  console.log('✓ Customers');

  // ── 8. Orders helper ─────────────────────────────────────────────────────
  async function createOrder({ orderId, itemId, paymentId, invId, customerId, customerName, customerEmail, templateId, templateVersionId, templateTitle, price, orderStatus, paymentStatus, daysAgo }) {
    const orderExists = await one(`SELECT id FROM orders WHERE id = $1`, [orderId]);
    if (orderExists) return;

    const createdAt    = new Date(Date.now() - daysAgo * 86400_000);
    const paidAt       = orderStatus === 'paid' ? new Date(createdAt.getTime() + 3_600_000) : null;
    const platformFee  = Math.round(price * 0.1);
    const tenantRevenue = price - platformFee;

    await q(`INSERT INTO orders (id,tenant_id,customer_id,customer_email,customer_name,status,subtotal,platform_fee,tenant_revenue,currency,created_at,paid_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'VND',$10,$11)`,
      [orderId, tenantId, customerId, customerEmail, customerName, orderStatus, price, platformFee, tenantRevenue, createdAt, paidAt]);

    await q(`INSERT INTO order_items (id,order_id,template_id,template_title,unit_price) VALUES ($1,$2,$3,$4,$5)`,
      [itemId, orderId, templateId, templateTitle, price]);

    await q(`INSERT INTO payments (id,order_id,provider,amount,currency,status) VALUES ($1,$2,'vnpay',$3,'VND',$4)`,
      [paymentId, orderId, price, paymentStatus]);

    if (invId && orderStatus === 'paid') {
      const slug = `moon-${orderId.slice(0, 8)}`;
      await q(`INSERT INTO invitations (id,order_item_id,template_id,template_version_id,customer_id,customer_email,public_slug,is_public)
        VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
        [invId, itemId, templateId, templateVersionId, customerId, customerEmail, slug]);
    }
  }

  // ── 9. Create orders ─────────────────────────────────────────────────────
  await createOrder({ orderId: o1Id, itemId: oi1Id, paymentId: p1Id, invId: inv1Id,
    customerId: ac1, customerName: 'Nguyễn Thu Hà',     customerEmail: 'nguyen.thu@example.com',
    templateId: t1Id, templateVersionId: tv1Id, templateTitle: 'Thiệp Cưới Thanh Lịch',
    price: 299000, orderStatus: 'paid', paymentStatus: 'success', daysAgo: 30 });

  await createOrder({ orderId: o2Id, itemId: oi2Id, paymentId: p2Id, invId: inv2Id,
    customerId: ac2, customerName: 'Trần Minh Khoa',    customerEmail: 'tran.minh@example.com',
    templateId: t2Id, templateVersionId: tv2Id, templateTitle: 'Hoa Hồng Vàng',
    price: 349000, orderStatus: 'paid', paymentStatus: 'success', daysAgo: 20 });

  await createOrder({ orderId: o3Id, itemId: oi3Id, paymentId: p3Id, invId: inv3Id,
    customerId: ac3, customerName: 'Lê Thị Bích Ngọc',  customerEmail: 'le.bich@example.com',
    templateId: t1Id, templateVersionId: tv1Id, templateTitle: 'Thiệp Cưới Thanh Lịch',
    price: 299000, orderStatus: 'paid', paymentStatus: 'success', daysAgo: 10 });

  await createOrder({ orderId: o4Id, itemId: oi4Id, paymentId: p4Id, invId: null,
    customerId: null, customerName: 'Phạm Văn An',      customerEmail: 'pham.van.an@example.com',
    templateId: t3Id, templateVersionId: tv3Id, templateTitle: 'Nhã Nhặn Tối Giản',
    price: 199000, orderStatus: 'pending', paymentStatus: 'pending', daysAgo: 2 });

  await createOrder({ orderId: o5Id, itemId: oi5Id, paymentId: p5Id, invId: null,
    customerId: ac1, customerName: 'Nguyễn Thu Hà',     customerEmail: 'nguyen.thu@example.com',
    templateId: t2Id, templateVersionId: tv2Id, templateTitle: 'Hoa Hồng Vàng',
    price: 349000, orderStatus: 'failed', paymentStatus: 'failed', daysAgo: 5 });

  console.log('✓ Orders, items, payments, invitations');

  // ── 10. Update purchase counts ───────────────────────────────────────────
  await q(`UPDATE templates SET purchase_count = 2 WHERE id = $1`, [t1Id]);
  await q(`UPDATE templates SET purchase_count = 1 WHERE id = $1`, [t2Id]);
  console.log('✓ Template purchase counts');

  await client.end();

  console.log('\n✅ Seed hoàn tất!');
  console.log('   Email   : formoontest@gmaill.com');
  console.log('   Password: Test@1234');
  console.log('   Tenant  : Moon Studio (moon-studio)');
  console.log('   Gói     : Pro');
  console.log('   Templates: 3 published, 1 draft');
  console.log('   Orders   : 3 paid, 1 pending, 1 failed');
  console.log('   Customers: Nguyễn Thu Hà, Trần Minh Khoa, Lê Thị Bích Ngọc');
}

main().catch((err) => {
  console.error('❌', err.message);
  client.end();
  process.exit(1);
});
