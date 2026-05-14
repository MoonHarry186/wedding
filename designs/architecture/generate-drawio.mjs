#!/usr/bin/env node
// Run: node generate-drawio.mjs
// Output: erd.drawio (import vào draw.io bằng File → Import From → Device)

// ─── TABLE DEFINITIONS ────────────────────────────────────────────────────────

const COLORS = {
  iam:          { fill: '#dae8fc', stroke: '#6c8ebf' }, // blue
  subscription: { fill: '#d5e8d4', stroke: '#82b366' }, // green
  storefront:   { fill: '#ffe6cc', stroke: '#d79b00' }, // orange
  catalog:      { fill: '#e1d5e7', stroke: '#9673a6' }, // purple
  customer:     { fill: '#fff2cc', stroke: '#d6b656' }, // yellow
  commerce:     { fill: '#f8cecc', stroke: '#b85450' }, // red
  invitation:   { fill: '#fce4d6', stroke: '#d79b00' }, // peach
  payout:       { fill: '#f5f5f5', stroke: '#666666' }, // grey
  ai:           { fill: '#e8d5f5', stroke: '#7b2fa8' }, // violet
};

const COL_W   = 270;  // table width
const ROW_H   = 26;   // field row height
const HEAD_H  = 32;   // table header height
const GAP_X   = 40;   // horizontal gap between columns
const GAP_Y   = 24;   // vertical gap between tables

const COL = [
  20,                           // col 0
  20 + COL_W + GAP_X,          // col 1
  20 + (COL_W + GAP_X) * 2,   // col 2
  20 + (COL_W + GAP_X) * 3,   // col 3
  20 + (COL_W + GAP_X) * 4,   // col 4
];

function h(n) { return HEAD_H + n * ROW_H; } // table height given n fields

// Layout: [col, y] assigned manually for readability
// Each entry: { name, col, y, color, fields: [{key, name, type}] }
const TABLES = [

  // ── IAM ──────────────────────────────────────────────────────────────────
  {
    name: 'users', col: 0, y: 20, color: COLORS.iam,
    fields: [
      { key: 'PK', name: 'id',            type: 'uuid' },
      { key: 'UK', name: 'email',          type: 'varchar' },
      { key: '',   name: 'password_hash',  type: 'varchar' },
      { key: '',   name: 'full_name',      type: 'varchar' },
      { key: '',   name: 'avatar_url',     type: 'varchar' },
      { key: '',   name: 'created_at',     type: 'timestamptz' },
      { key: '',   name: 'updated_at',     type: 'timestamptz' },
    ],
  },
  {
    name: 'tenants', col: 0, y: 20 + h(7) + GAP_Y, color: COLORS.iam,
    fields: [
      { key: 'PK', name: 'id',              type: 'uuid' },
      { key: 'UK', name: 'slug',            type: 'varchar' },
      { key: '',   name: 'name',            type: 'varchar' },
      { key: '',   name: 'logo_url',        type: 'varchar' },
      { key: '',   name: 'primary_color',   type: 'varchar' },
      { key: '',   name: 'description',     type: 'text' },
      { key: '',   name: 'commission_rate', type: 'numeric' },
      { key: '',   name: 'payout_info',     type: 'jsonb' },
      { key: '',   name: 'created_at',      type: 'timestamptz' },
    ],
  },
  {
    name: 'tenant_members', col: 0, y: 20 + h(7) + GAP_Y + h(9) + GAP_Y, color: COLORS.iam,
    fields: [
      { key: 'PK', name: 'id',         type: 'uuid' },
      { key: 'FK', name: 'tenant_id',  type: 'uuid' },
      { key: 'FK', name: 'user_id',    type: 'uuid' },
      { key: '',   name: 'role',       type: 'varchar' },
      { key: '',   name: 'joined_at',  type: 'timestamptz' },
    ],
  },

  // ── SUBSCRIPTION ─────────────────────────────────────────────────────────
  {
    name: 'subscription_plans',
    col: 0, y: 20 + h(7) + GAP_Y + h(9) + GAP_Y + h(5) + GAP_Y,
    color: COLORS.subscription,
    fields: [
      { key: 'PK', name: 'id',                  type: 'uuid' },
      { key: '',   name: 'name',                 type: 'varchar' },
      { key: '',   name: 'price_monthly',        type: 'numeric' },
      { key: '',   name: 'price_yearly',         type: 'numeric' },
      { key: '',   name: 'max_templates',        type: 'int' },
      { key: '',   name: 'max_members',          type: 'int' },
      { key: '',   name: 'custom_domain',        type: 'boolean' },
      { key: '',   name: 'marketplace_listing',  type: 'boolean' },
      { key: '',   name: 'ai_byok',              type: 'boolean' },
      { key: '',   name: 'is_active',            type: 'boolean' },
    ],
  },
  {
    name: 'subscriptions',
    col: 0, y: 20 + h(7) + GAP_Y + h(9) + GAP_Y + h(5) + GAP_Y + h(9) + GAP_Y,
    color: COLORS.subscription,
    fields: [
      { key: 'PK', name: 'id',                    type: 'uuid' },
      { key: 'FK', name: 'tenant_id',              type: 'uuid' },
      { key: 'FK', name: 'plan_id',                type: 'uuid' },
      { key: '',   name: 'status',                 type: 'varchar' },
      { key: '',   name: 'current_period_start',   type: 'timestamptz' },
      { key: '',   name: 'current_period_end',     type: 'timestamptz' },
      { key: '',   name: 'cancel_at_period_end',   type: 'boolean' },
      { key: '',   name: 'provider',               type: 'varchar' },
      { key: '',   name: 'provider_sub_id',        type: 'varchar' },
    ],
  },
  {
    name: 'subscription_events',
    col: 0, y: 20 + h(7) + GAP_Y + h(9) + GAP_Y + h(5) + GAP_Y + h(9) + GAP_Y + h(9) + GAP_Y,
    color: COLORS.subscription,
    fields: [
      { key: 'PK', name: 'id',              type: 'uuid' },
      { key: 'FK', name: 'subscription_id', type: 'uuid' },
      { key: 'FK', name: 'tenant_id',       type: 'uuid' },
      { key: '',   name: 'event_type',      type: 'varchar' },
      { key: 'FK', name: 'from_plan_id',    type: 'uuid' },
      { key: 'FK', name: 'to_plan_id',      type: 'uuid' },
      { key: '',   name: 'amount_paid',     type: 'numeric' },
      { key: '',   name: 'currency',        type: 'varchar' },
      { key: '',   name: 'provider',        type: 'varchar' },
      { key: '',   name: 'provider_txn_id', type: 'varchar' },
      { key: '',   name: 'period_start',    type: 'timestamptz' },
      { key: '',   name: 'period_end',      type: 'timestamptz' },
      { key: '',   name: 'created_at',      type: 'timestamptz' },
    ],
  },

  // ── STOREFRONT ───────────────────────────────────────────────────────────
  {
    name: 'storefronts', col: 1, y: 20, color: COLORS.storefront,
    fields: [
      { key: 'PK', name: 'id',              type: 'uuid' },
      { key: 'FK', name: 'tenant_id',       type: 'uuid' },
      { key: 'UK', name: 'custom_domain',   type: 'varchar' },
      { key: '',   name: 'domain_verified', type: 'boolean' },
      { key: '',   name: 'banner_url',      type: 'varchar' },
      { key: '',   name: 'welcome_text',    type: 'text' },
      { key: '',   name: 'seo_title',       type: 'varchar' },
      { key: '',   name: 'seo_description', type: 'varchar' },
      { key: '',   name: 'theme_color',     type: 'varchar' },
      { key: '',   name: 'social_links',    type: 'jsonb' },
      { key: '',   name: 'is_active',       type: 'boolean' },
    ],
  },

  // ── CATALOG ──────────────────────────────────────────────────────────────
  {
    name: 'template_categories', col: 1, y: 20 + h(11) + GAP_Y, color: COLORS.catalog,
    fields: [
      { key: 'PK', name: 'id',        type: 'uuid' },
      { key: 'FK', name: 'parent_id', type: 'uuid' },
      { key: '',   name: 'name',      type: 'varchar' },
      { key: 'UK', name: 'slug',      type: 'varchar' },
      { key: '',   name: 'icon_url',  type: 'varchar' },
    ],
  },
  {
    name: 'templates', col: 1, y: 20 + h(11) + GAP_Y + h(5) + GAP_Y, color: COLORS.catalog,
    fields: [
      { key: 'PK', name: 'id',                  type: 'uuid' },
      { key: 'FK', name: 'tenant_id',            type: 'uuid' },
      { key: 'FK', name: 'created_by',           type: 'uuid' },
      { key: 'FK', name: 'category_id',          type: 'uuid' },
      { key: 'FK', name: 'current_version_id',   type: 'uuid' },
      { key: '',   name: 'title',                type: 'varchar' },
      { key: '',   name: 'description',          type: 'text' },
      { key: '',   name: 'thumbnail_url',        type: 'varchar' },
      { key: '',   name: 'status',               type: 'varchar' },
      { key: '',   name: 'price',                type: 'numeric' },
      { key: '',   name: 'currency',             type: 'varchar' },
      { key: '',   name: 'view_count',           type: 'int' },
      { key: '',   name: 'purchase_count',       type: 'int' },
      { key: '',   name: 'published_at',         type: 'timestamptz' },
      { key: '',   name: 'created_at',           type: 'timestamptz' },
    ],
  },
  {
    name: 'template_versions', col: 1, y: 20 + h(11) + GAP_Y + h(5) + GAP_Y + h(15) + GAP_Y, color: COLORS.catalog,
    fields: [
      { key: 'PK', name: 'id',             type: 'uuid' },
      { key: 'FK', name: 'template_id',    type: 'uuid' },
      { key: 'FK', name: 'saved_by',       type: 'uuid' },
      { key: '',   name: 'version_number', type: 'int' },
      { key: '',   name: 'canvas_data',    type: 'jsonb' },
      { key: '',   name: 'change_note',    type: 'varchar' },
      { key: '',   name: 'created_at',     type: 'timestamptz' },
    ],
  },
  {
    name: 'template_variables', col: 1, y: 20 + h(11) + GAP_Y + h(5) + GAP_Y + h(15) + GAP_Y + h(7) + GAP_Y, color: COLORS.catalog,
    fields: [
      { key: 'PK', name: 'id',            type: 'uuid' },
      { key: 'FK', name: 'template_id',   type: 'uuid' },
      { key: '',   name: 'key',           type: 'varchar' },
      { key: '',   name: 'label',         type: 'varchar' },
      { key: '',   name: 'type',          type: 'varchar' },
      { key: '',   name: 'required',      type: 'boolean' },
      { key: '',   name: 'default_value', type: 'text' },
      { key: '',   name: 'placeholder',   type: 'varchar' },
      { key: '',   name: 'sort_order',    type: 'int' },
    ],
  },

  // ── MEDIA ────────────────────────────────────────────────────────────────
  {
    name: 'media_files', col: 2, y: 20, color: COLORS.catalog,
    fields: [
      { key: 'PK', name: 'id',            type: 'uuid' },
      { key: 'FK', name: 'tenant_id',     type: 'uuid' },
      { key: 'FK', name: 'uploaded_by',   type: 'uuid' },
      { key: '',   name: 'original_name', type: 'varchar' },
      { key: '',   name: 'mime_type',     type: 'varchar' },
      { key: '',   name: 'size_bytes',    type: 'bigint' },
      { key: '',   name: 'url',           type: 'varchar' },
      { key: '',   name: 'storage_key',   type: 'varchar' },
      { key: '',   name: 'created_at',    type: 'timestamptz' },
    ],
  },

  // ── CUSTOMER ─────────────────────────────────────────────────────────────
  {
    name: 'customers', col: 2, y: 20 + h(9) + GAP_Y, color: COLORS.customer,
    fields: [
      { key: 'PK', name: 'id',             type: 'uuid' },
      { key: 'UK', name: 'email',          type: 'varchar' },
      { key: '',   name: 'full_name',      type: 'varchar' },
      { key: '',   name: 'phone',          type: 'varchar' },
      { key: '',   name: 'password_hash',  type: 'varchar' },
      { key: '',   name: 'email_verified', type: 'boolean' },
      { key: '',   name: 'created_at',     type: 'timestamptz' },
    ],
  },

  // ── ORDERS ───────────────────────────────────────────────────────────────
  {
    name: 'orders', col: 2, y: 20 + h(9) + GAP_Y + h(7) + GAP_Y, color: COLORS.commerce,
    fields: [
      { key: 'PK', name: 'id',             type: 'uuid' },
      { key: 'FK', name: 'tenant_id',      type: 'uuid' },
      { key: 'FK', name: 'customer_id',    type: 'uuid' },
      { key: '',   name: 'customer_email', type: 'varchar' },
      { key: '',   name: 'customer_name',  type: 'varchar' },
      { key: '',   name: 'status',         type: 'varchar' },
      { key: '',   name: 'subtotal',       type: 'numeric' },
      { key: '',   name: 'platform_fee',   type: 'numeric' },
      { key: '',   name: 'tenant_revenue', type: 'numeric' },
      { key: '',   name: 'currency',       type: 'varchar' },
      { key: '',   name: 'created_at',     type: 'timestamptz' },
      { key: '',   name: 'paid_at',        type: 'timestamptz' },
    ],
  },
  {
    name: 'order_items', col: 2, y: 20 + h(9) + GAP_Y + h(7) + GAP_Y + h(12) + GAP_Y, color: COLORS.commerce,
    fields: [
      { key: 'PK', name: 'id',             type: 'uuid' },
      { key: 'FK', name: 'order_id',       type: 'uuid' },
      { key: 'FK', name: 'template_id',    type: 'uuid' },
      { key: '',   name: 'template_title', type: 'varchar' },
      { key: '',   name: 'unit_price',     type: 'numeric' },
    ],
  },

  // ── PAYMENTS ─────────────────────────────────────────────────────────────
  {
    name: 'payments', col: 3, y: 20, color: COLORS.commerce,
    fields: [
      { key: 'PK', name: 'id',                type: 'uuid' },
      { key: 'FK', name: 'order_id',          type: 'uuid' },
      { key: '',   name: 'provider',          type: 'varchar' },
      { key: 'UK', name: 'provider_txn_id',   type: 'varchar' },
      { key: '',   name: 'amount',            type: 'numeric' },
      { key: '',   name: 'currency',          type: 'varchar' },
      { key: '',   name: 'status',            type: 'varchar' },
      { key: '',   name: 'provider_response', type: 'jsonb' },
      { key: '',   name: 'created_at',        type: 'timestamptz' },
    ],
  },

  // ── INVITATION ───────────────────────────────────────────────────────────
  {
    name: 'invitations', col: 3, y: 20 + h(9) + GAP_Y, color: COLORS.invitation,
    fields: [
      { key: 'PK', name: 'id',                  type: 'uuid' },
      { key: 'FK', name: 'order_item_id',        type: 'uuid' },
      { key: 'FK', name: 'template_id',          type: 'uuid' },
      { key: 'FK', name: 'template_version_id',  type: 'uuid' },
      { key: 'FK', name: 'customer_id',          type: 'uuid' },
      { key: '',   name: 'customer_email',       type: 'varchar' },
      { key: 'UK', name: 'access_token',         type: 'uuid' },
      { key: 'UK', name: 'public_slug',          type: 'varchar' },
      { key: '',   name: 'is_public',            type: 'boolean' },
      { key: '',   name: 'view_count',           type: 'int' },
      { key: '',   name: 'created_at',           type: 'timestamptz' },
      { key: '',   name: 'expires_at',           type: 'timestamptz' },
    ],
  },
  {
    name: 'invitation_variables', col: 3, y: 20 + h(9) + GAP_Y + h(11) + GAP_Y, color: COLORS.invitation,
    fields: [
      { key: 'PK', name: 'id',            type: 'uuid' },
      { key: 'FK', name: 'invitation_id', type: 'uuid' },
      { key: '',   name: 'variable_key',  type: 'varchar' },
      { key: '',   name: 'value_text',    type: 'text' },
      { key: '',   name: 'value_json',    type: 'jsonb' },
      { key: '',   name: 'updated_at',    type: 'timestamptz' },
    ],
  },

  // ── AI ───────────────────────────────────────────────────────────────────
  {
    name: 'tenant_ai_configs', col: 4, y: 20, color: COLORS.ai,
    fields: [
      { key: 'PK', name: 'id',          type: 'uuid' },
      { key: 'FK', name: 'tenant_id',   type: 'uuid' },
      { key: '',   name: 'feature',     type: 'varchar' },
      { key: '',   name: 'provider',    type: 'varchar' },
      { key: '',   name: 'model',       type: 'varchar' },
      { key: '',   name: 'api_key_enc', type: 'text' },
      { key: '',   name: 'is_active',   type: 'boolean' },
      { key: '',   name: 'created_at',  type: 'timestamptz' },
      { key: '',   name: 'updated_at',  type: 'timestamptz' },
    ],
  },
  {
    name: 'ai_generation_logs', col: 4, y: 20 + h(9) + GAP_Y, color: COLORS.ai,
    fields: [
      { key: 'PK', name: 'id',          type: 'uuid' },
      { key: 'FK', name: 'tenant_id',   type: 'uuid' },
      { key: 'FK', name: 'user_id',     type: 'uuid' },
      { key: 'FK', name: 'config_id',   type: 'uuid' },
      { key: '',   name: 'feature',     type: 'varchar' },
      { key: '',   name: 'prompt',      type: 'text' },
      { key: '',   name: 'provider',    type: 'varchar' },
      { key: '',   name: 'model',       type: 'varchar' },
      { key: '',   name: 'tokens_input',  type: 'int' },
      { key: '',   name: 'tokens_output', type: 'int' },
      { key: '',   name: 'cost_usd',    type: 'numeric' },
      { key: '',   name: 'status',      type: 'varchar' },
      { key: '',   name: 'result_id',   type: 'uuid' },
      { key: '',   name: 'created_at',  type: 'timestamptz' },
    ],
  },

  // ── PAYOUT ───────────────────────────────────────────────────────────────
  {
    name: 'payouts', col: 4, y: 20 + h(9) + GAP_Y + h(14) + GAP_Y, color: COLORS.payout,
    fields: [
      { key: 'PK', name: 'id',           type: 'uuid' },
      { key: 'FK', name: 'tenant_id',    type: 'uuid' },
      { key: '',   name: 'period_start', type: 'date' },
      { key: '',   name: 'period_end',   type: 'date' },
      { key: '',   name: 'status',       type: 'varchar' },
      { key: '',   name: 'gross_amount', type: 'numeric' },
      { key: '',   name: 'platform_fee', type: 'numeric' },
      { key: '',   name: 'net_amount',   type: 'numeric' },
      { key: '',   name: 'paid_at',      type: 'timestamptz' },
      { key: '',   name: 'payment_ref',  type: 'varchar' },
    ],
  },
  {
    name: 'payout_items', col: 4, y: 20 + h(9) + GAP_Y + h(14) + GAP_Y + h(10) + GAP_Y, color: COLORS.payout,
    fields: [
      { key: 'PK', name: 'id',            type: 'uuid' },
      { key: 'FK', name: 'payout_id',     type: 'uuid' },
      { key: 'FK', name: 'order_item_id', type: 'uuid' },
      { key: '',   name: 'amount',        type: 'numeric' },
    ],
  },
];

// ─── EDGE DEFINITIONS ─────────────────────────────────────────────────────────
// { from: [table, field], to: [table, field], type: 'many-one' | 'one-one' }

const EDGES = [
  // IAM
  { from: ['tenant_members', 'tenant_id'],     to: ['tenants', 'id'],                type: 'many-one', label: 'thuộc về tenant' },
  { from: ['tenant_members', 'user_id'],       to: ['users', 'id'],                  type: 'many-one', label: 'thuộc về user' },
  // Subscription
  { from: ['subscriptions', 'tenant_id'],      to: ['tenants', 'id'],                type: 'many-one', label: 'đăng ký bởi' },
  { from: ['subscriptions', 'plan_id'],        to: ['subscription_plans', 'id'],     type: 'many-one', label: 'dùng gói' },
  // Subscription Events
  { from: ['subscription_events', 'subscription_id'], to: ['subscriptions', 'id'],   type: 'many-one', label: 'ghi log cho' },
  { from: ['subscription_events', 'tenant_id'],       to: ['tenants', 'id'],         type: 'many-one', label: 'sự kiện của tenant' },
  { from: ['subscription_events', 'from_plan_id'],    to: ['subscription_plans', 'id'], type: 'many-one', label: 'từ gói' },
  { from: ['subscription_events', 'to_plan_id'],      to: ['subscription_plans', 'id'], type: 'many-one', label: 'sang gói' },
  // Storefront
  { from: ['storefronts', 'tenant_id'],        to: ['tenants', 'id'],                type: 'one-one',  label: 'sở hữu bởi' },
  // Catalog
  { from: ['templates', 'tenant_id'],          to: ['tenants', 'id'],                type: 'many-one', label: 'thuộc về tenant' },
  { from: ['templates', 'created_by'],         to: ['users', 'id'],                  type: 'many-one', label: 'tạo bởi' },
  { from: ['templates', 'category_id'],        to: ['template_categories', 'id'],    type: 'many-one', label: 'thuộc danh mục' },
  { from: ['template_categories', 'parent_id'],to: ['template_categories', 'id'],    type: 'many-one', label: 'danh mục cha' },
  { from: ['template_versions', 'template_id'], to: ['templates', 'id'],             type: 'many-one', label: 'version của' },
  { from: ['template_versions', 'saved_by'],    to: ['users', 'id'],                 type: 'many-one', label: 'lưu bởi' },
  { from: ['template_variables', 'template_id'],to: ['templates', 'id'],             type: 'many-one', label: 'biến của template' },
  // Media
  { from: ['media_files', 'tenant_id'],        to: ['tenants', 'id'],                type: 'many-one', label: 'lưu trữ bởi' },
  { from: ['media_files', 'uploaded_by'],      to: ['users', 'id'],                  type: 'many-one', label: 'tải lên bởi' },
  // Commerce
  { from: ['orders', 'tenant_id'],             to: ['tenants', 'id'],                type: 'many-one', label: 'đơn hàng của tenant' },
  { from: ['orders', 'customer_id'],           to: ['customers', 'id'],              type: 'many-one', label: 'đặt bởi' },
  { from: ['order_items', 'order_id'],         to: ['orders', 'id'],                 type: 'many-one', label: 'thuộc đơn hàng' },
  { from: ['order_items', 'template_id'],      to: ['templates', 'id'],              type: 'many-one', label: 'mua template' },
  { from: ['payments', 'order_id'],            to: ['orders', 'id'],                 type: 'one-one',  label: 'thanh toán cho' },
  // Invitation
  { from: ['invitations', 'order_item_id'],    to: ['order_items', 'id'],            type: 'one-one',  label: 'phát sinh từ' },
  { from: ['invitations', 'template_id'],          to: ['templates', 'id'],          type: 'many-one', label: 'dựa trên template' },
  { from: ['invitations', 'template_version_id'],  to: ['template_versions', 'id'], type: 'many-one', label: 'khóa tại version' },
  { from: ['invitations', 'customer_id'],      to: ['customers', 'id'],              type: 'many-one', label: 'sở hữu bởi' },
  { from: ['invitation_variables', 'invitation_id'], to: ['invitations', 'id'],      type: 'many-one', label: 'giá trị của thiệp' },
  // Payout
  { from: ['payouts', 'tenant_id'],            to: ['tenants', 'id'],                type: 'many-one', label: 'chi trả cho' },
  { from: ['payout_items', 'payout_id'],       to: ['payouts', 'id'],                type: 'many-one', label: 'thuộc đợt payout' },
  { from: ['payout_items', 'order_item_id'],   to: ['order_items', 'id'],            type: 'many-one', label: 'phân bổ từ' },
  // AI
  { from: ['tenant_ai_configs', 'tenant_id'],  to: ['tenants', 'id'],                type: 'many-one', label: 'cấu hình AI của' },
  { from: ['ai_generation_logs', 'tenant_id'], to: ['tenants', 'id'],                type: 'many-one', label: 'dùng AI bởi tenant' },
  { from: ['ai_generation_logs', 'user_id'],   to: ['users', 'id'],                  type: 'many-one', label: 'kích hoạt bởi' },
  { from: ['ai_generation_logs', 'config_id'], to: ['tenant_ai_configs', 'id'],      type: 'many-one', label: 'dùng config' },
];

// ─── XML GENERATOR ────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowId(tableName, fieldName) {
  return `r_${tableName}_${fieldName}`;
}

function tableId(tableName) {
  return `t_${tableName}`;
}

function tableStyle({ fill, stroke }) {
  return `shape=table;startSize=${HEAD_H};container=1;collapsible=1;childLayout=tableLayout;` +
    `fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=13;` +
    `fillColor=${fill};strokeColor=${stroke};fontColor=#333333;`;
}

function rowStyle() {
  return `shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;` +
    `fillColor=none;collapsible=0;dropTarget=0;` +
    `points=[[0,0.5],[1,0.5]];portConstraint=eastwest;` +
    `fontSize=12;top=0;left=0;right=0;bottom=1;`;
}

function keyCellStyle(hasBold) {
  return `shape=partialRectangle;connectable=0;fillColor=none;` +
    `top=0;left=0;bottom=0;right=0;fontStyle=${hasBold ? 1 : 0};overflow=hidden;fontSize=10;`;
}

function nameCellStyle() {
  return `shape=partialRectangle;connectable=0;fillColor=none;` +
    `top=0;left=0;bottom=0;right=0;overflow=hidden;fontSize=12;`;
}

function typeCellStyle() {
  return `shape=partialRectangle;connectable=0;fillColor=none;` +
    `top=0;left=0;bottom=0;right=0;overflow=hidden;fontSize=10;fontColor=#888888;align=right;`;
}

function edgeStyle(type) {
  const isOne = type === 'one-one';
  return `edgeStyle=entityRelationEdgeStyle;` +
    `endArrow=${isOne ? 'ERmandOne' : 'ERzeroToMany'};` +
    `startArrow=ERmandOne;` +
    `exitX=1;exitY=0.5;exitDx=0;exitDy=0;` +
    `entryX=0;entryY=0.5;entryDx=0;entryDy=0;` +
    `rounded=0;`;
}

function generateTable(table) {
  const x = COL[table.col];
  const totalH = h(table.fields.length);
  const lines = [];

  lines.push(
    `<mxCell id="${tableId(table.name)}" value="${esc(table.name)}" ` +
    `style="${tableStyle(table.color)}" vertex="1" parent="1">` +
    `<mxGeometry x="${x}" y="${table.y}" width="${COL_W}" height="${totalH}" as="geometry"/>` +
    `</mxCell>`,
  );

  table.fields.forEach((field, i) => {
    const rowY = HEAD_H + i * ROW_H;
    const rid = rowId(table.name, field.name);

    lines.push(
      `<mxCell id="${rid}" value="" style="${rowStyle()}" vertex="1" parent="${tableId(table.name)}">` +
      `<mxGeometry y="${rowY}" width="${COL_W}" height="${ROW_H}" as="geometry"/>` +
      `</mxCell>`,
    );
    // Key cell (40px)
    lines.push(
      `<mxCell id="k_${table.name}_${field.name}" value="${esc(field.key)}" ` +
      `style="${keyCellStyle(!!field.key)}" vertex="1" parent="${rid}">` +
      `<mxGeometry width="40" height="${ROW_H}" as="geometry">` +
      `<mxRectangle width="40" height="${ROW_H}" as="alternateBounds"/></mxGeometry>` +
      `</mxCell>`,
    );
    // Name cell (150px)
    lines.push(
      `<mxCell id="n_${table.name}_${field.name}" value="${esc(field.name)}" ` +
      `style="${nameCellStyle()}" vertex="1" parent="${rid}">` +
      `<mxGeometry x="40" width="150" height="${ROW_H}" as="geometry">` +
      `<mxRectangle width="150" height="${ROW_H}" as="alternateBounds"/></mxGeometry>` +
      `</mxCell>`,
    );
    // Type cell (80px)
    lines.push(
      `<mxCell id="ty_${table.name}_${field.name}" value="${esc(field.type)}" ` +
      `style="${typeCellStyle()}" vertex="1" parent="${rid}">` +
      `<mxGeometry x="190" width="80" height="${ROW_H}" as="geometry">` +
      `<mxRectangle width="80" height="${ROW_H}" as="alternateBounds"/></mxGeometry>` +
      `</mxCell>`,
    );
  });

  return lines.join('\n');
}

function generateEdge(edge, idx) {
  const [fromTable, fromField] = edge.from;
  const [toTable, toField]     = edge.to;
  return (
    `<mxCell id="e${idx}" value="${esc(edge.label || '')}" style="${edgeStyle(edge.type)}" ` +
    `edge="1" source="${rowId(fromTable, fromField)}" target="${rowId(toTable, toField)}" parent="1">` +
    `<mxGeometry relative="1" as="geometry"/>` +
    `</mxCell>`
  );
}

function generate() {
  const tableCells = TABLES.map(generateTable).join('\n');
  const edgeCells  = EDGES.map((e, i) => generateEdge(e, i)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1"
  connect="1" arrows="1" fold="1" page="1" pageScale="1"
  pageWidth="1654" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${tableCells}
    ${edgeCells}
  </root>
</mxGraphModel>`;
}

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'erd.drawio');
writeFileSync(outPath, generate(), 'utf8');
console.log(`✓ Generated: ${outPath}`);
