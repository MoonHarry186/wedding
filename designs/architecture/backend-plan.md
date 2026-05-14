# Kế hoạch triển khai Backend — Cinlove SaaS

## Stack

| Layer | Công nghệ |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Auth | JWT (access + refresh token) |
| Queue | BullMQ + Redis |
| Storage | S3-compatible (MinIO local / AWS S3 prod) |
| Payment | VNPay, MoMo, Stripe |
| AI | Anthropic SDK, OpenAI SDK (BYOK) |
| Docs | Swagger (OpenAPI) |
| Test | Jest + Supertest |

---

## Cấu trúc thư mục

```
src/
├── common/
│   ├── decorators/        -- @CurrentTenant, @CurrentUser, @Public
│   ├── guards/            -- JwtGuard, TenantGuard, RolesGuard
│   ├── interceptors/      -- TenantContextInterceptor
│   ├── filters/           -- GlobalExceptionFilter
│   └── pipes/             -- ZodValidationPipe
├── config/                -- database, jwt, redis, s3, ai config
├── modules/
│   ├── auth/
│   ├── users/
│   ├── tenants/
│   ├── subscriptions/
│   ├── storefronts/
│   ├── templates/
│   ├── media/
│   ├── customers/
│   ├── orders/
│   ├── payments/
│   ├── invitations/
│   ├── payouts/
│   └── ai/
└── main.ts
```

---

## Phase 1 — Nền tảng (Tuần 1–2)

### 1.1 Khởi tạo project

```bash
nest new cinlove-api
# Thêm dependencies
pnpm add @nestjs/typeorm typeorm pg
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add @nestjs/config @nestjs/swagger
pnpm add bcrypt class-validator class-transformer
pnpm add zod
```

### 1.2 Database & Migration

- Cấu hình TypeORM với `synchronize: false` từ đầu, dùng migration
- Tạo entity cho tất cả bảng theo ERD
- Enable PostgreSQL RLS — mọi query filter `tenant_id` bắt buộc
- Migration seed: tạo sẵn 4 `subscription_plans` (Free, Pro, Business, Enterprise)

### 1.3 Module Auth

**Endpoints:**
```
POST /auth/register          -- tạo user + tenant mặc định
POST /auth/login             -- trả về access_token + refresh_token
POST /auth/refresh           -- đổi refresh token
POST /auth/logout
```

**Logic:**
- `access_token`: JWT, TTL 15 phút
- `refresh_token`: JWT, TTL 30 ngày, lưu hash vào DB
- `TenantContextInterceptor`: inject `tenantId` vào request từ subdomain header hoặc JWT payload

### 1.4 Module Users & Tenants

**Endpoints:**
```
GET  /users/me
PUT  /users/me

POST /tenants                -- tạo tenant mới (owner tự động)
GET  /tenants/me             -- thông tin tenant hiện tại
PUT  /tenants/me
GET  /tenants/me/members
POST /tenants/me/members/invite
PUT  /tenants/me/members/:id/role
DELETE /tenants/me/members/:id
```

---

## Phase 2 — Subscription (Tuần 3)

### 2.1 Module Subscriptions

**Endpoints:**
```
GET  /subscriptions/plans              -- danh sách gói
GET  /tenants/me/subscription          -- gói hiện tại của tenant
POST /tenants/me/subscription/checkout -- tạo phiên thanh toán
POST /tenants/me/subscription/cancel
GET  /tenants/me/subscription/history  -- subscription_events
```

**Logic:**
- Sau khi payment xác nhận → tạo/cập nhật `subscriptions` + ghi `subscription_events`
- `event_type`:
  - Lần đầu: `created`
  - Gia hạn: `renewed`
  - Đổi gói: `upgraded` hoặc `downgraded`

---

### 2.2 Tích hợp Payment Gateway (Phase 2A — VNPay)

> Ưu tiên VNPay vì phần lớn khách hàng là thị trường Việt Nam.

**Env vars cần thêm:**
```
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://api.cinlove.vn/payment/vnpay/return
```

**Các bước implement:**

1. **VNPayService** — build URL thanh toán theo chuẩn VNPay:
   - Tạo `vnp_Params` với các trường bắt buộc: `vnp_Amount`, `vnp_TxnRef`, `vnp_OrderInfo`...
   - Hash SHA-512 với `VNPAY_HASH_SECRET`
   - Trả về URL redirect

2. **Webhook IPN** — `POST /webhooks/vnpay`:
   - Verify chữ ký từ VNPay
   - Nếu hợp lệ → gọi `SubscriptionsService.activateSubscription()`
   - Trả về `{ RspCode: '00', Message: 'Confirm Success' }`

3. **Return URL** — `GET /payment/vnpay/return`:
   - Redirect người dùng về frontend sau khi thanh toán
   - Truyền `status=success|failed` qua query param

---

### 2.3 Tích hợp Payment Gateway (Phase 2B — MoMo)

> Ví điện tử phổ biến nhất Việt Nam, đặc biệt với người dùng mobile.

**Env vars cần thêm:**
```
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_API_URL=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=https://cinlove.vn/payment/callback
MOMO_IPN_URL=https://api.cinlove.vn/webhooks/momo
```

**Các bước implement:**

1. **MoMoService** — tạo payment request:
   - Build body JSON với `partnerCode`, `orderId`, `amount`, `requestType = payWithATM`
   - HMAC SHA-256 với `MOMO_SECRET_KEY`
   - Gọi MoMo API → lấy `payUrl`

2. **Webhook IPN** — `POST /webhooks/momo`:
   - Verify HMAC signature
   - `resultCode = 0` → gọi `activateSubscription()`

---

### 2.4 Tích hợp Payment Gateway (Phase 2C — ZaloPay)

> Phổ biến với người dùng Zalo, thanh toán qua QR hoặc app.

**Env vars cần thêm:**
```
ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_API_URL=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_CALLBACK_URL=https://api.cinlove.vn/webhooks/zalopay
```

**Các bước implement:**

1. **ZaloPayService** — tạo order:
   - Build `app_trans_id` (YYMMdd_unique), `app_time`, `item`, `amount`
   - HMAC SHA-256 với `KEY1`
   - Gọi API → lấy `order_url`

2. **Webhook** — `POST /webhooks/zalopay`:
   - Verify HMAC với `KEY2`
   - `return_code = 1` → gọi `activateSubscription()`

---

### 2.5 Tích hợp Payment Gateway (Phase 2D — PayOS / VietQR)

> Chuẩn VietQR — người dùng quét mã bằng app ngân hàng bất kỳ (NAPAS).
> Phù hợp cho khách không dùng ví điện tử, không cần tài khoản thẻ quốc tế.

**Env vars cần thêm:**
```
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

**Các bước implement:**

1. **PayOSService** — tạo payment link:
   - Dùng SDK `@payos/node`
   - Gọi `payOS.createPaymentLink({ orderCode, amount, description, returnUrl, cancelUrl })`
   - Trả về `checkoutUrl`

2. **Webhook** — `POST /webhooks/payos`:
   - Verify checksum bằng `PAYOS_CHECKSUM_KEY`
   - `code = 00` → gọi `activateSubscription()`

---

### 2.6 Tích hợp Payment Gateway (Phase 2E — Stripe)

> Dành cho khách quốc tế, tích hợp sau các cổng nội địa.

**Env vars cần thêm:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Các bước implement:**

1. **Stripe Checkout Session** — thay thế mock URL trong `checkout()`:
   - Tạo `stripe.checkout.sessions.create()` với `line_items` từ plan
   - Trả về `session.url` thay vì mock URL

2. **Webhook** — `POST /webhooks/stripe`:
   - Verify signature bằng `stripe.webhooks.constructEvent()`
   - Xử lý event `checkout.session.completed` → `activateSubscription()`

---

### 2.4 Subscription Lifecycle (Phase 2C)

**Cron job** — chạy mỗi ngày lúc 00:00:

1. Query tất cả `subscriptions` có `current_period_end < NOW()` và `status = active`
2. Nếu `cancel_at_period_end = true` → set `status = cancelled`, downgrade về Free
3. Nếu không → đánh dấu `status = past_due` (chờ gia hạn)

**Email notifications** (qua SendGrid):

| Email | Trigger |
|---|---|
| Sắp hết hạn | 3 ngày trước `current_period_end` |
| Đã gia hạn thành công | Sau `event_type = renewed` |
| Đã hủy | Sau `event_type = cancelled` |
| Hóa đơn | Sau mỗi lần thanh toán thành công |

**Thứ tự build Phase 2:**

| Bước | Nội dung | Ưu tiên |
|---|---|---|
| 2A | VNPay — IPN webhook + return URL | Cao |
| 2B | MoMo — HMAC + IPN | Cao |
| 2C | ZaloPay — HMAC + callback | Trung bình |
| 2D | PayOS / VietQR — SDK + webhook | Trung bình |
| 2E | Stripe — checkout session + webhook | Thấp (quốc tế) |
| 2F | Cron job expire + email notifications | Cao |

**Abstraction pattern** — tất cả provider implement chung interface:
```typescript
interface PaymentProvider {
  createPaymentUrl(params: CreatePaymentParams): Promise<string>;
  verifyWebhook(payload: unknown, headers: Record<string, string>): boolean;
  extractTxnInfo(payload: unknown): TxnInfo;
}
```
`PaymentsService` gọi qua interface → dễ thêm provider mới mà không sửa business logic.

---

## Phase 3 — Catalog (Tuần 4–5)

### 3.1 Module Templates

**Endpoints:**
```
GET    /template-categories
POST   /template-categories          -- admin only

GET    /templates                    -- list (filter: status, category)
POST   /templates                    -- tạo template mới
GET    /templates/:id
PUT    /templates/:id
DELETE /templates/:id
PUT    /templates/:id/publish
PUT    /templates/:id/archive

GET    /templates/:id/variables
POST   /templates/:id/variables
PUT    /templates/:id/variables/:varId
DELETE /templates/:id/variables/:varId
```

**Logic:**
- `canvas_data` validate bằng Zod schema trước khi lưu
- Kiểm tra `subscription_plans.max_templates` trước khi cho phép tạo mới
- `status` flow: `draft → published → archived`

### 3.2 Module Media

**Endpoints:**
```
POST /media/upload           -- upload file, trả về url
GET  /media                  -- list file của tenant
DELETE /media/:id
```

**Logic:**
- Validate MIME type (image/jpeg, image/png, image/webp)
- Resize/compress ảnh trước khi upload lên S3 (sharp)
- `tenant_id` null = platform-level asset

---

## Phase 4 — Commerce (Tuần 6–7)

### 4.1 Module Customers

```
POST /customers/register
POST /customers/login
POST /customers/refresh
GET  /customers/me
PUT  /customers/me
GET  /customers/me/orders
GET  /customers/me/invitations
```

**Logic:**
- Tách biệt hoàn toàn với `users` (B2B vs B2C)
- Guest checkout: không cần register, chỉ cần email

### 4.2 Module Orders

```
POST /orders/checkout        -- tạo đơn hàng
GET  /orders/:id
GET  /orders                 -- tenant xem đơn của shop mình
```

**Logic khi tạo order:**
1. Validate template `status = published`
2. Snapshot `template_title`, `unit_price`
3. Tính `platform_fee = subtotal * tenant.commission_rate`
4. Tính `tenant_revenue = subtotal - platform_fee`
5. Tạo `payment` với `status = pending`
6. Trả về payment URL

### 4.3 Module Payments

```
POST /payments/vnpay/webhook
POST /payments/momo/webhook
POST /payments/stripe/webhook
GET  /payments/:id
```

**Logic webhook:**
1. Verify chữ ký từ provider
2. Cập nhật `payments.status`
3. Nếu `success` → tạo `invitation` cho từng `order_item`
4. Gửi email cho customer kèm `access_token`

---

## Phase 5 — Invitation (Tuần 8)

### 5.1 Module Invitations

```
GET  /invitations/:id                     -- tenant xem
GET  /w/:slug                             -- public view (không cần auth)
GET  /invitations/access/:token           -- guest access qua email token

PUT  /invitations/:id/variables           -- điền biến
PUT  /invitations/:id/publish             -- bật is_public
GET  /invitations/:id/preview             -- preview trước khi publish
```

**Logic:**
- `access_token` check trong header hoặc query param
- Tăng `view_count` mỗi lần xem public
- `expires_at` check — trả 410 Gone nếu hết hạn

---

## Phase 6 — AI (Tuần 9)

### 6.1 Module AI

```
GET  /ai/configs                          -- list configs của tenant
POST /ai/configs                          -- thêm provider + model + API key
PUT  /ai/configs/:id
DELETE /ai/configs/:id

POST /ai/generate/template                -- gen canvas_data từ prompt
POST /ai/generate/image                   -- gen ảnh background
POST /ai/extract-variables                -- extract biến từ text tự nhiên
GET  /ai/logs                             -- lịch sử generation của tenant
```

**Logic generate template:**
1. Kiểm tra `subscription_plans.ai_byok`
2. Load `tenant_ai_configs` theo feature `template_gen`
3. Decrypt `api_key_enc` → gọi provider
4. Validate response JSON với Zod (đúng `canvas_data` schema)
5. Ghi `ai_generation_logs`
6. Nếu không có BYOK config → dùng Cinlove default key

**Bảo mật API key:**
- Mã hóa AES-256-GCM trước khi lưu DB
- Key mã hóa lưu trong env, không bao giờ expose ra API response

---

## Phase 7 — Payout (Tuần 10)

### 7.1 Module Payouts

```
GET  /payouts                             -- tenant xem lịch sử
GET  /payouts/:id
GET  /payouts/:id/items

-- Admin only
POST /admin/payouts/generate              -- tạo payout cho kỳ
PUT  /admin/payouts/:id/process
PUT  /admin/payouts/:id/mark-paid
```

**Logic generate payout:**
1. Query `order_items` chưa có trong `payout_items`, `order.status = paid`
2. Group theo `tenant_id`
3. Tạo `payout` + `payout_items`
4. Chạy qua BullMQ queue (không block request)

---

## Phase 8 — Storefront & SEO (Tuần 11)

```
GET  /storefronts/:slug                   -- public, không cần auth
PUT  /tenants/me/storefront               -- tenant cập nhật
POST /tenants/me/storefront/verify-domain -- verify custom domain DNS
```

---

## Bảo mật & Multi-tenancy

### Tenant Isolation
Mọi service method đều nhận `tenantId` từ context, không từ request body:

```typescript
// Guard inject vào request
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    req.tenantId = req.user.tenantId; // từ JWT
    return true;
  }
}

// Service luôn filter theo tenantId
findAll(tenantId: string) {
  return this.repo.find({ where: { tenantId } });
}
```

### Rate Limiting
- Global: 100 req/min per IP
- AI endpoints: 10 req/min per tenant
- Auth endpoints: 5 req/min per IP

---

## Thứ tự ưu tiên build

| Phase | Module | Tuần |
|---|---|---|
| 1 | Auth, Users, Tenants | 1–2 |
| 2 | Subscriptions | 3 |
| 3 | Templates, Media | 4–5 |
| 4 | Customers, Orders, Payments | 6–7 |
| 5 | Invitations | 8 |
| 6 | AI | 9 |
| 7 | Payouts | 10 |
| 8 | Storefronts | 11 |

---

## Quyết định kiến trúc

### 1. Tenant Routing — Subdomain + Custom Domain

Tenant được identify theo thứ tự ưu tiên:

```
Request đến
    ↓
Kiểm tra Host header
    ├── khớp custom_domain trong DB (storefronts.custom_domain + domain_verified = true)
    │       → resolve tenantId từ custom domain
    ├── khớp pattern *.cinlove.vn
    │       → extract slug → resolve tenantId từ tenants.slug
    └── không khớp → 404
```

**Implement bằng `TenantResolverMiddleware`:**
```typescript
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.hostname;

    // Custom domain
    const storefront = await this.storefrontRepo.findOne({
      where: { customDomain: host, domainVerified: true },
    });
    if (storefront) {
      req['tenantId'] = storefront.tenantId;
      return next();
    }

    // Subdomain *.cinlove.vn
    const slug = host.replace('.cinlove.vn', '');
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (tenant) {
      req['tenantId'] = tenant.id;
      return next();
    }

    throw new NotFoundException('Tenant not found');
  }
}
```

**Verify custom domain** — kiểm tra DNS TXT record:
```
TXT cinlove-verify=<token>   →   domain_verified = true
```

### 2. Kiến trúc — Monolith NestJS

1 project duy nhất, chia module rõ ràng. Không tách service cho đến khi có nhu cầu thực tế.

```
cinlove-api/          ← 1 NestJS project
├── src/modules/      ← các module độc lập
└── docker-compose.yml
```

### 3. Email — SendGrid

Dùng `@sendgrid/mail`. Các email cần template:
| Email | Trigger |
|---|---|
| Xác nhận đăng ký | `POST /auth/register` |
| Thiệp đã sẵn sàng | Sau payment thành công |
| Link access token | Khi invitation tạo xong |
| Thông báo payout | Khi payout `status = paid` |
| Hóa đơn gia hạn | Sau `subscription_events.renewed` |

### 4. Local Dev — Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: cinlove
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
```

Chạy local: `docker compose up -d` → `pnpm start:dev`
