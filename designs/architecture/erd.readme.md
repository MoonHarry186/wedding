# ERD Giải thích — Cinlove SaaS Platform

## Tổng quan

ERD gồm 7 nhóm chính, phản ánh toàn bộ luồng từ khi doanh nghiệp đăng ký đến khi khách hàng nhận thiệp và doanh nghiệp nhận tiền.

---

## 1. Người dùng & Doanh nghiệp (IAM)

```
users ──< tenant_members >── tenants
```

| Bảng | Vai trò |
|---|---|
| `users` | Tài khoản đăng nhập (chủ shop, designer...) |
| `tenants` | Mỗi tenant là 1 doanh nghiệp/shop thiệp, có subdomain `{slug}.cinlove.vn` |
| `tenant_members` | Bảng trung gian — 1 user có thể thuộc nhiều tenant với vai trò `owner / admin / editor` |

---

## 2. Gói đăng ký (Subscription)

```
subscription_plans ──< subscriptions >── tenants
```

| Bảng | Vai trò |
|---|---|
| `subscription_plans` | Định nghĩa các gói Free / Pro / Business / Enterprise và giới hạn tương ứng |
| `subscriptions` | Ghi nhận tenant đang dùng gói nào, còn hạn không, thanh toán qua VNPay hay Stripe |

> **Lưu ý:** Hiện tại bảng `subscriptions` chỉ lưu trạng thái hiện tại — mỗi lần gia hạn sẽ ghi đè `current_period_start` / `current_period_end`. Cần thêm bảng `subscription_events` để lưu lịch sử (xem phần Thiếu sót bên dưới).

---

## 3. Storefront

```
tenants ──|| storefronts
```

- Mỗi tenant có **đúng 1 trang shop** (`storefronts`) — banner, màu sắc, SEO, mạng xã hội.
- Gói Enterprise có thể gắn domain riêng (`custom_domain`).

---

## 4. Template & Biến số (Catalog — phần cốt lõi)

```
template_categories ──< templates ──< template_variables
```

| Bảng | Vai trò |
|---|---|
| `templates` | Thiệp mẫu do tenant tạo ra. Toàn bộ layout lưu trong `canvas_data` (JSON: elements, kích thước, background) |
| `template_variables` | Các "ô trống" trong thiệp: `bride_name`, `wedding_date`, `venue`... mỗi ô có kiểu dữ liệu (`text / date / image / number / color`) |
| `template_categories` | Phân loại thiệp (Tiệc cưới, Sinh nhật...), hỗ trợ danh mục lồng nhau qua `parent_id` |

**Cơ chế render:**
Khi hiển thị thiệp, hệ thống thay `element.content` trong `canvas_data` bằng giá trị tương ứng trong `invitation_variables`.

---

## 5. Khách hàng & Đơn hàng (Commerce)

```
customers ──< orders ──< order_items
                  └──── payments
```

| Bảng | Vai trò |
|---|---|
| `customers` | Người mua thiệp. `password_hash = null` → guest checkout, không cần tài khoản |
| `orders` | Đơn hàng. Lưu snapshot `platform_fee` (Cinlove giữ) và `tenant_revenue` (shop nhận) tại thời điểm mua |
| `order_items` | Mỗi item trong đơn là 1 template đã mua. Lưu snapshot `template_title` phòng trường hợp template bị xóa sau |
| `payments` | Giao dịch thanh toán qua VNPay / MoMo / Stripe |

---

## 6. Thiệp đã điền (Invitation)

```
order_items ──|| invitations ──< invitation_variables
```

Đây là **sản phẩm cuối** khách nhận được sau khi mua:

| Bảng | Vai trò |
|---|---|
| `invitations` | Bản thiệp cá nhân hóa. Có link chia sẻ `{tenant}.cinlove.vn/w/{public_slug}` |
| `invitation_variables` | Giá trị thực tế điền vào từng ô: `bride_name = "Lan"`, `wedding_date = "15/8/2026"` |

**Truy cập không cần đăng nhập:**
- Khách nhận `access_token` (UUID) qua email → xem thiệp mà không cần tài khoản.
- `is_public = false` → chỉ xem được qua `access_token`.

---

## 7. Thanh toán cho Shop (Payout)

```
tenants ──< payouts ──< payout_items ──── order_items
```

| Bảng | Vai trò |
|---|---|
| `payouts` | Đợt thanh toán cuối kỳ cho từng tenant sau khi Cinlove trừ hoa hồng |
| `payout_items` | Chi tiết từng `order_item` thuộc đợt payout đó |

---

## Luồng hoàn chỉnh

```
Tenant tạo template (canvas_data + template_variables)
        ↓
Khách hàng vào shop → mua template → tạo order + payment
        ↓
Hệ thống tạo invitation → khách điền invitation_variables
        ↓
Khách nhận link thiệp cá nhân hóa, chia sẻ lên mạng xã hội
        ↓
Cuối tháng: Cinlove trừ hoa hồng, chuyển tiền cho tenant qua payout
```

---

## Bổ sung đã thực hiện

### ✓ Lịch sử gia hạn gói — `subscription_events`

Đã thêm vào `erd.md`. Bảng này ghi lại mọi sự kiện liên quan đến subscription thay vì ghi đè trạng thái cũ.

| Field | Mô tả |
|---|---|
| `event_type` | `created / renewed / upgraded / downgraded / cancelled / reactivated / past_due` |
| `from_plan_id` | Gói cũ (null nếu là lần tạo đầu tiên) |
| `to_plan_id` | Gói mới |
| `amount_paid` | Số tiền thực tế thanh toán kỳ đó |
| `provider_txn_id` | Mã giao dịch từ VNPay / Stripe để đối soát |
| `period_start / period_end` | Kỳ hạn tương ứng với lần thanh toán này |

Hệ thống giờ trả lời được:
- Tenant đã gia hạn bao nhiêu kỳ?
- Họ từng nâng/hạ gói bao giờ chưa?
- Tổng doanh thu từ một tenant cụ thể?
- Tenant nào hay thanh toán trễ?
- Audit khi có tranh chấp thanh toán?
