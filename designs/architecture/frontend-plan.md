# Cinlove Frontend — Kế hoạch triển khai

## Stack

| Thành phần    | Thư viện                        | Ghi chú                                     |
| ------------- | ------------------------------- | ------------------------------------------- |
| Framework     | Next.js 16 (App Router)         | SSR cho storefront B2C, CSR cho dashboard   |
| Language      | TypeScript                      | Strict mode                                 |
| Styling       | Tailwind CSS 4 (`important` via CSS) | `@import "tailwindcss" important` trong globals.css — không có `tailwind.config.js` |
| Layout        | Ant Design (antd) v5            | Layout tổng thể: `Layout`, `Sider`, `Menu`, `Grid` — antd là xương sống cấu trúc trang |
| UI Components | Ant Design (antd) v5            | Table, Form, Modal, Drawer, Steps, notification... |
| Client State  | Zustand v5                      | Không cần Provider; `auth.store.ts`, `ui.store.ts` |
| Server State  | TanStack Query v5               | Cache API, background refetch; config tập trung trong `QueryProvider` |
| Forms         | Ant Design Form                 | Tích hợp sẵn validation, phù hợp với antd   |
| HTTP client   | Axios                           | `withCredentials: true`; access token in-memory (`tokenStore`), refresh token httpOnly cookie |
| Canvas editor | Custom (React + HTML/CSS)       | Kéo thả absolute positioned elements        |
| Notifications | antd `message` / `notification` | Đồng nhất với UI system                     |
| Icons         | `@remixicon/react`              | `RemixiconComponentType` cho menu config và components |

---

## Design System

> Source: [`designs/ui-designs/digital_invitation_design_system/DESIGN.md`](../ui-designs/digital_invitation_design_system/DESIGN.md)

### Brand & Personality
**Sophisticated, authoritative, clean** — cảm giác như một premium stationery boutique kết hợp trong phần mềm hiệu suất cao. B2B dashboard dùng tông Slate trung tính để tập trung vào data; B2C storefront dùng Indigo nhiều hơn để tạo cảm giác đặc biệt.

### Color Tokens

| Token                   | Hex         | Dùng ở đâu                                      |
| ----------------------- | ----------- | ------------------------------------------------ |
| `primary`               | `#070235`   | CTA chính, navigation header, brand moments      |
| `primary-container`     | `#1e1b4b`   | Hover/active state của primary                   |
| `on-primary-container`  | `#8683ba`   | Text trên primary-container                      |
| `inverse-primary`       | `#c4c1fb`   | Accent nhẹ trên nền tối                          |
| `secondary`             | `#515f74`   | Icon, metadata, secondary actions                |
| `secondary-container`   | `#d5e3fc`   | Badge, tag nền nhẹ                               |
| `surface`               | `#f7f9fb`   | Background chính (toàn trang)                    |
| `surface-container-low` | `#f2f4f6`   | Sidebar, card nền nhạt                           |
| `surface-container`     | `#eceef0`   | Divider, input nền                               |
| `on-surface`            | `#191c1e`   | Text chính                                       |
| `on-surface-variant`    | `#47464f`   | Text phụ, placeholder                            |
| `outline`               | `#787680`   | Border mặc định                                  |
| `outline-variant`       | `#c8c5d0`   | Border nhẹ, separator                            |
| `error`                 | `#ba1a1a`   | Lỗi form, destructive action                     |
| `error-container`       | `#ffdad6`   | Background thông báo lỗi                         |

### Typography

| Scale         | Font        | Size / Weight | Dùng ở đâu                                  |
| ------------- | ----------- | ------------- | ------------------------------------------- |
| `display`     | Noto Serif  | 48px / 600    | Hero heading storefront                     |
| `h1`          | Noto Serif  | 36px / 600    | Page title storefront                       |
| `h2`          | Noto Serif  | 28px / 500    | Section heading storefront                  |
| `h3`          | Noto Serif  | 22px / 500    | Card title storefront / modal heading       |
| `body-lg`     | Inter       | 18px / 400    | CTA text storefront                         |
| `body-md`     | Inter       | 16px / 400    | Text chính dashboard                        |
| `body-sm`     | Inter       | 14px / 400    | Table cell, form label, metadata dashboard  |
| `label-caps`  | Inter       | 12px / 600    | Uppercase label, tag — `letter-spacing: 0.05em` |
| `button`      | Inter       | 15px / 500    | Button text — `letter-spacing: 0.01em`      |

### Elevation

| Level      | Shadow CSS                                          | Dùng ở đâu                          |
| ---------- | --------------------------------------------------- | ----------------------------------- |
| Level 0    | none                                                | Background, input field             |
| Level 1    | `0px 2px 4px rgba(30,27,75,0.04)` + border 1px     | Card, container                     |
| Level 2    | `0px 10px 25px rgba(30,27,75,0.08)`                 | Modal, dropdown, card hover         |

### Spacing Scale (4px base)

`xs: 8px` · `sm: 16px` · `md: 24px` · `lg: 40px` · `xl: 64px` · `gutter: 24px` · `margin: 32px`

### Shape (Rounded)

`sm: 2px` · `DEFAULT: 4px` · `md: 6px` · `lg: 8px` · `xl: 12px` · `full: 9999px`

### Tailwind + antd coexist

```js
// tailwind.config.js
module.exports = {
  important: true,          // ← bắt buộc — Tailwind utilities thắng antd class
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#070235',
        'primary-container': '#1e1b4b',
        secondary: '#515f74',
        surface: '#f7f9fb',
        'on-surface': '#191c1e',
        // ... đầy đủ từ DESIGN.md
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

```tsx
// app/layout.tsx — antd ConfigProvider với theme token map sang design system
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#070235',
      colorBgBase: '#f7f9fb',
      colorTextBase: '#191c1e',
      borderRadius: 4,
      fontFamily: 'Inter, sans-serif',
    },
  }}
>
  {children}
</ConfigProvider>
```

---

## Cấu trúc thư mục

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      layout.tsx                  # DashboardLayout — sidebar + topbar
      page.tsx                    # /dashboard — overview
      templates/
        page.tsx                  # Danh sách templates
        [id]/page.tsx             # Template detail + versions
      editor/
        [id]/page.tsx             # Canvas editor full screen
      orders/
        page.tsx
        [id]/page.tsx
      customers/
        page.tsx
      invitations/
        page.tsx
      ai/
        page.tsx                  # AI config + generate tabs
      payouts/
        page.tsx
      settings/
        page.tsx                  # Tenant info
        storefront/page.tsx
        domain/page.tsx
        members/page.tsx
        subscription/page.tsx
    (storefront)/
      s/[slug]/page.tsx           # Public storefront — SSR
      s/[slug]/templates/[id]/page.tsx
      invitations/[slug]/page.tsx # Xem thiệp — SSR
  components/
    layout/
      DashboardSidebar.tsx
      DashboardTopbar.tsx
    editor/
      EditorCanvas.tsx
      EditorSidebar.tsx
      EditorToolbar.tsx
      elements/
        TextElement.tsx
        ImageElement.tsx
      panels/
        TextPanel.tsx
        ImagePanel.tsx
    storefront/
      TemplateCard.tsx
      CheckoutSteps.tsx
  lib/
    axios.ts                      # Axios instance + interceptors
    errorHandler.ts               # Parse AxiosError → AppError, map HTTP status → message/action
    utils.ts
  api/                            # Typed API functions
    auth.api.ts
    tenants.api.ts
    templates.api.ts
    media.api.ts
    orders.api.ts
    customers.api.ts
    invitations.api.ts
    ai.api.ts
    payouts.api.ts
    storefronts.api.ts
  store/
    index.ts                      # Redux store
    slices/
      auth.slice.ts               # user, tenant, tokens
      editor.slice.ts             # elements, selectedId, zoom, activeTool
      ui.slice.ts                 # sidebar collapsed, loading states
  hooks/
    useAuth.ts                    # Wrapper Redux auth slice
    useTemplates.ts               # TanStack Query hooks
    useOrders.ts
    useInvitations.ts
    ...
  types/
    api.ts                        # Response types map với backend entities
    editor.ts                     # CanvasElement, TextElement, ImageElement
  constants/
    filename.constant.ts
    menu.constant.ts              # menuItems config — label, icon, href, roles, children
  middleware.ts                   # Next.js middleware — redirect /login nếu chưa auth
```

---

## Menu Config (`constants/menu.constant.ts`)

`DashboardSidebar` đọc `menuItems` để render antd `Menu` — không hard-code JSX trong sidebar.

```ts
import type { ComponentType } from 'react'

type Role = 'owner' | 'admin' | 'editor' | 'viewer'

type MenuLeaf = {
  type: 'item'
  label: string
  href: string
  icon: ComponentType
  roles: Role[]
}

type MenuGroup = {
  type: 'group'
  label: string
  icon: ComponentType
  roles: Role[]
  children: MenuLeaf[]
}

export type MenuItem = MenuLeaf | MenuGroup

export const menuItems: MenuItem[] = [
  {
    type: 'item',
    label: 'Dashboard',
    href: '/dashboard',
    icon: RiDashboardLine,
    roles: ['owner', 'admin', 'editor', 'viewer'],
  },
  {
    type: 'group',
    label: 'Templates',
    icon: RiLayoutLine,
    roles: ['owner', 'admin', 'editor'],
    children: [
      { type: 'item', label: 'Danh sách', href: '/dashboard/templates', icon: RiListCheck, roles: ['owner', 'admin', 'editor'] },
      { type: 'item', label: 'Editor', href: '/dashboard/editor', icon: RiEditLine, roles: ['owner', 'admin', 'editor'] },
    ],
  },
  {
    type: 'group',
    label: 'Kinh doanh',
    icon: RiShoppingBag3Line,
    roles: ['owner', 'admin'],
    children: [
      { type: 'item', label: 'Đơn hàng', href: '/dashboard/orders', icon: RiOrderPlayLine, roles: ['owner', 'admin'] },
      { type: 'item', label: 'Khách hàng', href: '/dashboard/customers', icon: RiUserLine, roles: ['owner', 'admin'] },
      { type: 'item', label: 'Thiệp', href: '/dashboard/invitations', icon: RiMailLine, roles: ['owner', 'admin'] },
    ],
  },
  {
    type: 'group',
    label: 'Cài đặt',
    icon: RiSettings3Line,
    roles: ['owner', 'admin'],
    children: [
      { type: 'item', label: 'Cửa hàng', href: '/dashboard/settings', icon: RiStoreLine, roles: ['owner', 'admin'] },
      { type: 'item', label: 'Thành viên', href: '/dashboard/settings/members', icon: RiTeamLine, roles: ['owner', 'admin'] },
      { type: 'item', label: 'Gói dịch vụ', href: '/dashboard/settings/subscription', icon: RiVipCrownLine, roles: ['owner'] },
      { type: 'item', label: 'Domain', href: '/dashboard/settings/domain', icon: RiGlobalLine, roles: ['owner'] },
      { type: 'item', label: 'Storefront', href: '/dashboard/settings/storefront', icon: RiPaintLine, roles: ['owner', 'admin'] },
    ],
  },
  {
    type: 'item',
    label: 'AI',
    href: '/dashboard/ai',
    icon: RiRobot2Line,
    roles: ['owner', 'admin'],
  },
  {
    type: 'item',
    label: 'Payouts',
    href: '/dashboard/payouts',
    icon: RiMoneyDollarCircleLine,
    roles: ['owner'],
  },
]
```

`DashboardSidebar` filter `menuItems` theo `user.role` trước khi truyền vào antd `Menu` — không render item nếu role không match.

---

## Routing

```
# ── Auth (Public) ──────────────────────────────────────────────────────────
/login                            Đăng nhập
/register                         Đăng ký
/forget-password                  Quên mật khẩu — nhập email nhận link reset

# ── Dashboard (Protected) ──────────────────────────────────────────────────
/dashboard                        Overview stats
/dashboard/templates              Danh sách templates
/dashboard/templates/[id]         Template detail + versions
/dashboard/editor/[id]            Canvas editor full screen
/dashboard/orders                 Danh sách đơn hàng
/dashboard/orders/[id]            Order detail
/dashboard/customers              Danh sách khách hàng
/dashboard/invitations            Danh sách thiệp
/dashboard/ai                     AI config + generate
/dashboard/payouts                Payout history
/dashboard/settings               Tenant info
/dashboard/settings/storefront    Storefront config
/dashboard/settings/domain        Custom domain
/dashboard/settings/members       Team members
/dashboard/settings/subscription  Plan + billing

# ── Storefront B2C (Public, SSR) ───────────────────────────────────────────
/s/[slug]                         Public storefront
/s/[slug]/templates/[id]          Template detail public
/invitations/[slug]               Xem thiệp (access_token qua query param)
/payment/result                   Callback sau thanh toán (VNPay/MoMo/Stripe)

# ── Global / Error ─────────────────────────────────────────────────────────
/403                              Forbidden — không đủ quyền (role thấp hơn required)
/not-found                        404 — page không tồn tại (alias, thực tế dùng not-found.tsx)
```

### Next.js App Router — File-based error handling

| File                         | Vị trí           | Khi nào render                                                  |
| ---------------------------- | ---------------- | --------------------------------------------------------------- |
| `app/not-found.tsx`          | Root             | Mọi route không khớp (`notFound()` hoặc URL không tồn tại)      |
| `app/error.tsx`              | Root             | Runtime error không catch được (500) — có nút "Thử lại"         |
| `app/global-error.tsx`       | Root             | Lỗi trong root layout — fallback cuối cùng                      |
| `app/(dashboard)/error.tsx`  | Dashboard group  | Lỗi runtime trong dashboard, giữ nguyên sidebar                 |
| `app/(storefront)/error.tsx` | Storefront group | Lỗi runtime trong storefront public                             |
| `app/403/page.tsx`           | Root             | Redirect đến đây khi middleware hoặc page phát hiện thiếu quyền |

### Luồng redirect lỗi

```
Chưa đăng nhập → truy cập /dashboard/*
  └─ middleware.ts → redirect /login?from=/dashboard/...

Đã đăng nhập nhưng role không đủ (editor cố vào admin route)
  └─ page.tsx kiểm tra role → redirect /403

API trả về 404 (template/order không tồn tại)
  └─ page.tsx gọi notFound() → render app/not-found.tsx

API trả về 500 hoặc network error
  └─ error.tsx render với nút "Thử lại"

Token hết hạn, refresh thất bại
  └─ Axios interceptor → dispatch logout() → redirect /login
```

---

## Phân chia phases

> **Ký hiệu placeholder:**
>
> - `[ design ]` — trang đã tạo file, chờ design
> - `[ done ]` — trang hoàn chỉnh
> - `[ logic ]` — không có UI riêng, chỉ là logic/layout

---

### Phase 1 — Setup + Auth

**Mục tiêu:** Project chạy được, đăng nhập/đăng ký, vào được dashboard

#### Trang & file

| File                                  | Route             | Mô tả                                      | Design                                             |
| ------------------------------------- | ----------------- | ------------------------------------------ | -------------------------------------------------- |
| `app/(auth)/login/page.tsx`           | `/login`          | Form đăng nhập                             | `designs/ui-designs/login-in/code.html`            |
| `app/(auth)/register/page.tsx`        | `/register`       | Form đăng ký tài khoản + tạo tenant        | `designs/ui-designs/register/code.html`            |
| `app/(auth)/forget-password/page.tsx` | `/forget-password`| Nhập email nhận link reset password        | `designs/ui-designs/forget-password/code.html`     |
| `app/(dashboard)/layout.tsx`          | —                 | Sidebar + Topbar wrapper (antd `Layout`)   | `designs/ui-designs/dashboard/code.html`           |
| `app/(dashboard)/page.tsx`            | `/dashboard`      | Trang chủ dashboard (placeholder greeting) | `designs/ui-designs/dashboard/code.html`           |
| `app/not-found.tsx`                   | `*`               | 404 toàn cục                               | `designs/ui-designs/404/code.html`                 |
| `app/403/page.tsx`                    | `/403`            | Forbidden — thiếu quyền                    | `designs/ui-designs/403/code.html`                 |
| `app/error.tsx`                       | —                 | Runtime error (500) toàn cục               | `designs/ui-designs/system-error/code.html`        |
| `app/global-error.tsx`                | —                 | Lỗi root layout                            | `[ logic ]`                                        |
| `app/(dashboard)/error.tsx`           | —                 | Runtime error trong dashboard              | `designs/ui-designs/system-error/code.html`        |

#### Placeholder mẫu

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">[ Login Page — design pending ]</p>
    </div>
  );
}
```

#### Tasks kỹ thuật

- [ ] Khởi tạo Next.js 15 + TypeScript + Tailwind 4 + antd v5
- [ ] `tailwind.config.js` — set `important: true`, extend colors/fonts từ design system
- [ ] `app/layout.tsx` — antd `ConfigProvider` với theme token map sang design system tokens
- [ ] `constants/menu.constant.ts` — `menuItems` config, `DashboardSidebar` đọc để render antd `Menu`
- [ ] `lib/axios.ts` — Axios instance, `withCredentials: true` để gửi HttpOnly cookies, auto refresh khi 401
- [ ] `lib/errorHandler.ts` — parse `AxiosError` → `AppError`, map status → message/action
- [ ] `store/useAuthStore.ts` — lưu `user`, `tenant` trong memory (không dùng `localStorage`); gọi API `/auth/me` lúc khởi động để lấy thông tin.
- [ ] `middleware.ts` — check auth, redirect `/login?from=...`

**Deliverable:** Đăng ký → Login → Dashboard → Logout hoạt động end-to-end

---

### Phase 2 — Dashboard Overview + Tenant Settings

**Mục tiêu:** Xem tổng quan số liệu, quản lý thông tin tenant, members, subscription, storefront

#### Trang & file

| File                                             | Route                              | Mô tả                                                  | Design                                                   |
| ------------------------------------------------ | ---------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `app/(dashboard)/page.tsx`                       | `/dashboard`                       | Stats cards: templates, orders, doanh thu, invitations | `designs/ui-designs/dashboard/code.html`                 |
| `app/(dashboard)/settings/page.tsx`              | `/dashboard/settings`              | Cập nhật tên shop, logo, màu sắc                       | `designs/ui-designs/root-settings/code.html`             |
| `app/(dashboard)/settings/members/page.tsx`      | `/dashboard/settings/members`      | Danh sách members, invite, đổi role, remove            | `designs/ui-designs/team-members/code.html`              |
| `app/(dashboard)/settings/subscription/page.tsx` | `/dashboard/settings/subscription` | Plan hiện tại, quota, danh sách plans, upgrade         | `designs/ui-designs/subscriptions/code.html`             |
| `app/(dashboard)/settings/storefront/page.tsx`   | `/dashboard/settings/storefront`   | Banner, welcome text, SEO, social links, theme color   | `[ design ]`                                             |
| `app/(dashboard)/settings/domain/page.tsx`       | `/dashboard/settings/domain`       | Setup custom domain, DNS TXT record, verify            | `designs/ui-designs/custom-domain/code.html`             |

#### Tasks kỹ thuật

- [ ] `api/tenants.api.ts` — GET/PUT tenant, members CRUD, storefront, domain
- [ ] `hooks/useTenant.ts` — TanStack Query wrappers
- [ ] Settings layout với antd `Menu` tabs dọc (Settings sidebar)

**Deliverable:** Tenant cấu hình đầy đủ shop, team, storefront

---

### Phase 3 — Template Management + Canvas Editor

**Mục tiêu:** CRUD templates, chỉnh sửa canvas, publish

#### Trang & file

| File                                      | Route                      | Mô tả                                           | Design                                          |
| ----------------------------------------- | -------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `app/(dashboard)/templates/page.tsx`      | `/dashboard/templates`     | Grid/list templates, filter, search, tạo mới    | `designs/ui-designs/templates/code.html`        |
| `app/(dashboard)/templates/[id]/page.tsx` | `/dashboard/templates/:id` | Metadata, version history, variables, thumbnail | `[ design ]`                                    |
| `app/(dashboard)/editor/[id]/page.tsx`    | `/dashboard/editor/:id`    | Canvas editor full screen                       | `designs/ui-designs/editor/code.html`           |

#### Components editor (tất cả `[ design ]`)

| File                                          | Mô tả                                         |
| --------------------------------------------- | --------------------------------------------- |
| `components/editor/EditorCanvas.tsx`          | Vùng canvas 794×1123px, click-to-select, drag |
| `components/editor/EditorToolbar.tsx`         | Undo/Redo, Zoom, Save, Publish                |
| `components/editor/EditorSidebar.tsx`         | Tabs: Elements / Layers / Variables           |
| `components/editor/elements/TextElement.tsx`  | Text box, highlight `{{variable}}`            |
| `components/editor/elements/ImageElement.tsx` | Image với resize handle                       |
| `components/editor/panels/TextPanel.tsx`      | Font size/weight/color/align/spacing          |
| `components/editor/panels/ImagePanel.tsx`     | Opacity, fit mode                             |

#### Tasks kỹ thuật

- [ ] `store/slices/editor.slice.ts` — elements, selectedId, zoom, activeTool, isDirty, history stack
- [ ] `api/templates.api.ts` — CRUD, versions, publish/archive
- [ ] `api/media.api.ts` — upload S3
- [ ] Auto-save draft Redux → localStorage mỗi 30s

**Deliverable:** Tạo và publish template với canvas editor hoàn chỉnh

---

### Phase 4 — Orders & Customers

**Mục tiêu:** Theo dõi đơn hàng, quản lý khách hàng

#### Trang & file

| File                                   | Route                   | Mô tả                                   | Design                                          |
| -------------------------------------- | ----------------------- | --------------------------------------- | ----------------------------------------------- |
| `app/(dashboard)/orders/page.tsx`      | `/dashboard/orders`     | Bảng orders, filter status + date range | `designs/ui-designs/orders/code.html`           |
| `app/(dashboard)/orders/[id]/page.tsx` | `/dashboard/orders/:id` | Order detail: items, payment, timeline  | `designs/ui-designs/order-detail/code.html`     |
| `app/(dashboard)/customers/page.tsx`   | `/dashboard/customers`  | Bảng customers, search, type badge      | `designs/ui-designs/customers/code.html`        |

#### Components (tất cả `[ design ]`)

| File                                            | Mô tả                              |
| ----------------------------------------------- | ---------------------------------- |
| `components/orders/OrderStatusTag.tsx`          | antd `Tag` màu theo status         |
| `components/orders/OrderDetailDrawer.tsx`       | Drawer order items + payment info  |
| `components/customers/CustomerDetailDrawer.tsx` | Drawer lịch sử orders của customer |

#### Tasks kỹ thuật

- [ ] `api/orders.api.ts` — list, detail
- [ ] `api/customers.api.ts` — list, detail
- [ ] `hooks/useOrders.ts`, `hooks/useCustomers.ts`

**Deliverable:** Xem đầy đủ orders và customers

---

### Phase 5 — Invitations

**Mục tiêu:** Xem thiệp đã tạo, preview, copy link chia sẻ

#### Trang & file

| File                                           | Route                    | Mô tả                                    | Status       |
| ---------------------------------------------- | ------------------------ | ---------------------------------------- | ------------ |
| `app/(dashboard)/invitations/page.tsx`         | `/dashboard/invitations` | Bảng invitations, filter template + date | `[ design ]` |
| `app/(storefront)/invitations/[slug]/page.tsx` | `/invitations/:slug`     | Public view thiệp — SSR                  | `[ design ]` |

#### Components (tất cả `[ design ]`)

| File                                                | Mô tả                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `components/invitations/InvitationDetailDrawer.tsx` | Canvas preview + copy share link                                    |
| `components/invitations/CanvasRenderer.tsx`         | Render `canvasData` JSON thành HTML (dùng chung dashboard + public) |

#### Tasks kỹ thuật

- [ ] `api/invitations.api.ts` — list (dashboard), public get by slug+token
- [ ] `CanvasRenderer` — render canvasData với variables đã điền, dùng lại ở cả dashboard preview và public page

**Deliverable:** Share link hoạt động, người nhận xem được thiệp

---

### Phase 6 — AI Features

**Mục tiêu:** Cấu hình BYOK, generate template / image / variables

#### Trang & file

| File                          | Route           | Mô tả                                                    | Status       |
| ----------------------------- | --------------- | -------------------------------------------------------- | ------------ |
| `app/(dashboard)/ai/page.tsx` | `/dashboard/ai` | 4 tabs: Config / Gen Template / Gen Image / Extract Vars | `[ design ]` |

#### Components (tất cả `[ design ]`)

| File                                    | Mô tả                                     |
| --------------------------------------- | ----------------------------------------- |
| `components/ai/AIConfigTab.tsx`         | Table configs, modal thêm/xóa config BYOK |
| `components/ai/GenerateTemplateTab.tsx` | Textarea prompt → canvas JSON preview     |
| `components/ai/GenerateImageTab.tsx`    | Textarea prompt → image result            |
| `components/ai/ExtractVariablesTab.tsx` | Paste JSON → danh sách variable tags      |
| `components/ai/AIUsageLogTable.tsx`     | Lịch sử generate: tokens, cost, status    |

#### Tasks kỹ thuật

- [ ] `api/ai.api.ts` — configs CRUD, generate template/image, extract variables, logs
- [ ] Plan gate UI — hiển thị upgrade prompt nếu plan không đủ (403 từ API)

**Deliverable:** Dùng AI generate template/image, quản lý BYOK keys

---

### Phase 7 — Payouts

**Mục tiêu:** Xem lịch sử payout, breakdown per order

#### Trang & file

| File                               | Route                | Mô tả                              | Status       |
| ---------------------------------- | -------------------- | ---------------------------------- | ------------ |
| `app/(dashboard)/payouts/page.tsx` | `/dashboard/payouts` | Bảng payouts, status badge, filter | `[ design ]` |

#### Components (tất cả `[ design ]`)

| File                                        | Mô tả                                   |
| ------------------------------------------- | --------------------------------------- |
| `components/payouts/PayoutDetailDrawer.tsx` | Tổng doanh thu + bảng payout items      |
| `components/payouts/PayoutStatusTag.tsx`    | antd `Tag`: pending / processing / paid |

#### Tasks kỹ thuật

- [ ] `api/payouts.api.ts` — list, detail, items
- [ ] `hooks/usePayouts.ts`

**Deliverable:** Tenant xem được tiền cần nhận và đã nhận

---

### Phase 8 — Public Storefront B2C

**Mục tiêu:** Khách hàng duyệt template, mua, điền thông tin, nhận link thiệp

#### Trang & file

| File                                                | Route                    | Mô tả                                                | Design                                              |
| --------------------------------------------------- | ------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `app/(storefront)/s/[slug]/page.tsx`                | `/s/:slug`               | Storefront công khai — SSR                           | `designs/ui-designs/storefront/code.html`           |
| `app/(storefront)/s/[slug]/templates/[id]/page.tsx` | `/s/:slug/templates/:id` | Template detail public — SSR                         | `[ design ]`                                        |
| `app/(storefront)/s/[slug]/checkout/page.tsx`       | `/s/:slug/checkout`      | Checkout 3 bước (thông tin → variables → thanh toán) | `designs/ui-designs/checkout/code.html`             |
| `app/(storefront)/payment/result/page.tsx`          | `/payment/result`        | Kết quả thanh toán (success / failed)                | `designs/ui-designs/succesful-paid/code.html`       |
| `app/(storefront)/invitations/[slug]/page.tsx`      | `/invitations/:slug`     | Xem thiệp — SSR (dùng chung Phase 5)                 | `[ design ]`                                        |

#### Components (tất cả `[ design ]`)

| File                                          | Mô tả                                 |
| --------------------------------------------- | ------------------------------------- |
| `components/storefront/StorefrontHeader.tsx`  | Banner, logo, welcome text tenant     |
| `components/storefront/TemplateCard.tsx`      | Card thumbnail, title, price, nút Xem |
| `components/storefront/CheckoutStepper.tsx`   | antd `Steps` 3 bước                   |
| `components/storefront/VariableForm.tsx`      | Dynamic form từ template variables    |
| `components/storefront/PaymentSelector.tsx`   | Chọn VNPay / MoMo / Stripe            |
| `components/storefront/PaymentResultCard.tsx` | Success/failed card + link thiệp      |

#### Tasks kỹ thuật

- [ ] `api/storefronts.api.ts` — public storefront, templates, checkout, payment
- [ ] `generateMetadata()` cho SSR SEO (title, description, og:image từ storefront data)
- [ ] Guest checkout — không cần account, chỉ cần email

**Deliverable:** Toàn bộ luồng mua thiệp từ đầu đến cuối

---

## Thứ tự triển khai

```
Phase 1 → Phase 2 → Phase 3 → Phase 8 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

> Phase 8 (Storefront B2C) kéo lên trước Phase 4–7 vì đây là mặt tiền demo với khách hàng thực.

---

## Quyết định kỹ thuật đã chốt

| Câu hỏi                  | Quyết định                                                      |
| ------------------------ | --------------------------------------------------------------- |
| Framework                | Next.js 15 App Router                                           |
| Styling                  | Tailwind CSS 4 với `important: true` — Tailwind utility thắng antd class |
| Layout                   | Ant Design v5 — `Layout`, `Sider`, `Menu`, `Grid` là xương sống cấu trúc |
| UI System                | Ant Design v5 — Table, Form, Modal, Drawer, Steps, Select...    |
| Client State             | Redux Toolkit                                                   |
| Forms                    | Ant Design Form                                                 |
| Server State             | TanStack Query v5                                               |
| HTTP                     | Axios + interceptors                                            |
| Canvas render            | HTML div absolute positioned (custom, không dùng Fabric/Konva)  |
| Storefront SEO           | Next.js SSR với `generateMetadata()`                            |
| Editor state persistence | Redux + `localStorage` (auto-save draft mỗi 30s)                |
| Upload ảnh               | Upload lên S3 trước (`POST /media`), lưu URL vào canvas element |
