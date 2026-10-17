# Plan: UI Checkout → Order → Payment Flow

> **Phạm vi**: Xây dựng luồng giao diện từ **chọn sản phẩm test** → **Checkout (preview)** → **Đặt hàng thành công** → **Thanh toán** → **Thanh toán thành công**.
>
> **Stack**: Next.js App Router · Tailwind CSS (custom tokens `globals.css`) · Zustand · TanStack React Query · Lucide React · Sonner · react-hook-form + zod

---

## Tổng quan luồng (Flow Overview)

```
┌──────────────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Giỏ hàng thật /     │ ──► │   Checkout Page   │ ──► │  Order Success    │ ──► │  Payment Flow  │ ──► │ Payment Success  │
│  sản phẩm chọn       │     │  (preview + form) │     │  (kết quả + CTA)  │     │  (redirect/...)│     │  (xác nhận)      │
└──────────────────────┘     └──────────────────┘     └───────────────────┘     └────────────────┘     └──────────────────┘
```

> Flow chính của app là lấy dữ liệu từ `user/cart` và `selected cart item IDs` thay vì phụ thuộc hoàn toàn vào trang test demo.

---

## Mục lục

1. [Trang Test Entry](#1-trang-test-entry)
2. [Trang Checkout](#2-trang-checkout-preview)
3. [Trang Order Success](#3-trang-order-success)
4. [Trang Payment / Redirect](#4-trang-payment--redirect)
5. [Trang Payment Result](#5-trang-payment-result)
6. [Cấu trúc thư mục & Route](#6-cấu-trúc-thư-mục--route)
7. [Shared Components cần xây thêm](#7-shared-components-cần-xây-thêm)
8. [Hooks & Stores cần xây](#8-hooks--stores-cần-xây)
9. [Thứ tự triển khai](#9-thứ-tự-triển-khai)

---

## 1. Trang Test Entry (dev-only / hỗ trợ kiểm tra nhanh)

> **Route**: `/(main)/checkout/test/page.tsx`
>
> **Mục đích**: Trang tiện ích cho dev kiểm tra nhanh các kịch bản, nhưng app chính không dựa vào đây. Luồng thực tế phải lấy dữ liệu từ `user/cart` hoặc product detail.

### Giao diện

- Tiêu đề **"Checkout Test"**
- 2 card lựa chọn, mỗi card có border + hover effect (`border-surface-border`, `hover:border-primary/40`):

| Lựa chọn | Mô tả | Data gửi đi |
|---|---|---|
| **🛒 Mua ngay (BUY_NOW)** | Product ID = `6`, Quantity = `3` | `{ checkout_type: "BUY_NOW", buy_now_item: { product_id: 6, quantity: 3 } }` |
| **🛍️ Từ giỏ hàng thật (CART)** | Lấy item IDs đã chọn từ `user/cart` | `{ checkout_type: "CART", cart_item_ids: [selectedCartItemIds] }` |

### Hành vi

- `user/cart` là nguồn dữ liệu chính cho flow CART thực tế: người dùng chọn item trong giỏ → click checkout → push tới `/checkout?checkout_type=CART&cart_item_ids=...`.
- `/checkout/test` chỉ dùng cho debug/dev khi cần mock nhanh mà không thao tác bằng UI thật.
- Với các kịch bản khác, có thể cho phép nhập tay `product_id`, `quantity`, `cart_item_ids` để linh hoạt test.

### Type sử dụng

- `CheckoutType`, `CheckoutPreviewRequest`, `BuyNowItem` từ `@/features/orders/types`

---

## 2. Trang Checkout (Preview)

> **Route**: `/(main)/checkout/page.tsx`
>
> **Mục đích**: Hiển thị preview đơn hàng, chọn địa chỉ & phương thức thanh toán, xác nhận đặt hàng.

### Layout tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHECKOUT PAGE                               │
├─────────────────────────────────────┬───────────────────────────┤
│  LEFT COLUMN (md:col-span-8)       │  RIGHT COLUMN (md:col-4)  │
│                                     │                           │
│  ┌───────────────────────────────┐  │  ┌───────────────────────┐│
│  │ 📦 Danh sách sản phẩm        │  │  │ 📋 Tóm tắt đơn hàng  ││
│  │  ┌──────┬────────┬───┬─────┐ │  │  │                       ││
│  │  │ Ảnh  │ Tên SP │SL │Giá  │ │  │  │  Tạm tính:  xxx đ    ││
│  │  ├──────┼────────┼───┼─────┤ │  │  │  Phí ship:  (tính sau)││
│  │  │ ...  │ ...    │...│ ... │ │  │  │  ────────────────────  ││
│  │  └──────┴────────┴───┴─────┘ │  │  │  TỔNG:      xxx đ     ││
│  └───────────────────────────────┘  │  │                       ││
│                                     │  │  [  ĐẶT HÀNG  ]      ││
│  ┌───────────────────────────────┐  │  │  (btn primary full-w) ││
│  │ 📍 Địa chỉ giao hàng        │  │  └───────────────────────┘│
│  │  ┌─────────────────────────┐ │  │                           │
│  │  │ AddressSelector (có sẵn)│ │  │                           │
│  │  │ Hiện địa chỉ default   │ │  │                           │
│  │  │ Click → Modal chọn/CRUD│ │  │                           │
│  │  └─────────────────────────┘ │  │                           │
│  └───────────────────────────────┘  │                           │
│                                     │                           │
│  ┌───────────────────────────────┐  │                           │
│  │ 💳 Phương thức thanh toán    │  │                           │
│  │  ○ VNPAY  (icon + label)     │  │                           │
│  │  ○ COD    (icon + label)     │  │                           │
│  └───────────────────────────────┘  │                           │
│                                     │                           │
│  ┌───────────────────────────────┐  │                           │
│  │ 📝 Ghi chú (optional)       │  │                           │
│  │  [TextArea]                  │  │                           │
│  └───────────────────────────────┘  │                           │
└─────────────────────────────────┴───────────────────────────────┘
```

### Các section chi tiết

#### 2.1. Danh sách sản phẩm (`CheckoutItemList`)

- Gọi `orderApi.getCheckoutPreview(payload)` để lấy danh sách item + subtotal
- Render bảng/grid: **ảnh** (48×48, rounded) | **tên SP** | **đơn giá** | **SL** | **thành tiền**
- Chỉ **hiển thị** (read-only), không cho sửa quantity tại đây
- Dùng `CheckoutPreviewResponse`, `CheckoutItemResponse`

#### 2.2. Địa chỉ giao hàng (`AddressSelector` — đã có)

- **Sử dụng component có sẵn**: `AddressSelector` từ `@/features/shipping-address/components`
- Hiển thị địa chỉ **mặc định** (`is_default: true`) khi load
- Click → mở **Modal** (không sổ dropdown) với `AddressList` bên trong → chọn / thêm / sửa / xóa
- Kết hợp `useShippingAddresses` hook + `useAddressStore` (Zustand) cho dialog form
- Kết hợp `AddressFormDialog` cho thêm/sửa trong Modal

#### 2.3. Phương thức thanh toán (`PaymentMethodSelector`)

- Component mới: radio group với 2 option
- Mỗi option là một card nhỏ có:
  - Radio indicator (circle)
  - Icon: VNPAY → icon custom hoặc `CreditCard` từ lucide; COD → `Banknote` từ lucide
  - Label: "Thanh toán VNPAY" / "Thanh toán khi nhận hàng (COD)"
  - Mô tả ngắn (optional)
- Selected state: `border-primary`, `bg-primary-light/30`
- Unselected: `border-surface-border`
- Dùng `PaymentMethod` type (chỉ filter `"VNPAY"` | `"COD"`)

#### 2.4. Ghi chú đơn hàng

- `TextArea` component có sẵn (`@/components/ui/input`)
- Optional, placeholder: "Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính...)"

#### 2.5. Tóm tắt đơn hàng (`OrderSummaryCard`) — Sidebar phải

- Sticky (`sticky top-4`)
- Hiển thị:
  - Tạm tính (subtotal từ preview)
  - Phí vận chuyển (nếu backend hỗ trợ, không thì ghi "Tính khi giao")
  - **Tổng cộng** (bold, text-lg, `text-primary`)
- Nút **"Đặt hàng"** — `Button` component primary, full-width
  - Disabled nếu: chưa chọn address / chưa chọn payment method / đang loading
  - Loading state khi đang gọi API

### API calls khi submit

```ts
// Build payload
const payload: CreateOrderRequest = {
    items: previewItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
    })),
    expected_subtotal: previewData.subtotal,
    address_id: selectedAddress.address_id,
    payment_method: selectedPaymentMethod, // "VNPAY" | "COD"
    note: note || null,
};

// Call API
const result: OrderCreateResponse = await orderApi.createOrder(payload);
// → result: { order_id, payment_method, total, status }

// Redirect tới trang order success
router.push(`/checkout/success?order_id=${result.order_id}`);
```

### Validation (client-side)

| Field | Rule |
|---|---|
| `address_id` | Required — phải chọn địa chỉ |
| `payment_method` | Required — phải chọn 1 trong 2 |
| `items` | Phải có ít nhất 1 item (từ preview) |

### Mobile responsive

- Trên mobile: 1 cột, sidebar tóm tắt chuyển xuống dưới cùng hoặc thành **sticky bottom bar** chỉ hiện tổng + nút đặt hàng

---

## 3. Trang Order Success

> **Route**: `/(main)/checkout/success/page.tsx`
>
> **Mục đích**: Xác nhận đơn hàng đã được tạo thành công, cung cấp các hành động tiếp theo.

### Giao diện

```
┌──────────────────────────────────────────────┐
│            ✅  ĐẶT HÀNG THÀNH CÔNG           │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │  Mã đơn hàng:    #ORD-xxxxxxx          │  │
│  │  Tổng tiền:      xxx.xxx đ              │  │
│  │  Thanh toán:      VNPAY / COD           │  │
│  │  Trạng thái:      Chờ xác nhận          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │  Các lựa chọn tiếp theo:               │  │
│  │                                         │  │
│  │  [🔍 Xem chi tiết đơn hàng]  (outline) │  │
│  │  [💳 Thanh toán ngay]         (primary) │  │
│  │  [🛒 Tiếp tục mua sắm]      (ghost)   │  │
│  └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Logic hiển thị nút "Thanh toán ngay"

- **Chỉ hiện** khi `payment_method === "VNPAY"` VÀ `payment_status === "PENDING"`
- Khi click → gọi `paymentApi.createPayment({ order_id })` → nhận `payment_url` → redirect browser tới VNPAY
- Nếu `payment_method === "COD"` → ẩn nút thanh toán, chỉ hiện "Xem đơn hàng" + "Tiếp tục mua sắm"

### Data source

- Nhận `order_id` từ query params
- Gọi `orderApi.getOrderDetail(orderId)` để lấy thông tin đầy đủ (hoặc dùng data cache từ `OrderCreateResponse` truyền qua store)
- Fallback: nếu không có `order_id` → redirect về `/` hoặc hiện thông báo lỗi

### Responsive

- Centered card layout, max-width ~`500px`, padding comfortable

---

## 4. Trang Payment / Redirect

> **Route**: Không cần page riêng — chỉ cần logic redirect
>
> **Mục đích**: Xử lý redirect tới cổng thanh toán VNPAY

### Flow

```
User click "Thanh toán ngay"
       │
       ▼
paymentApi.createPayment({ order_id })
       │
       ▼
Response: { payment_url, payment_method, amount, message }
       │
       ├── payment_url !== null → window.location.href = payment_url (redirect ra VNPAY)
       │
       └── payment_url === null → Hiện toast error / fallback message
```

### UX trong lúc chờ

- Nút "Thanh toán ngay" chuyển loading state (spinner + "Đang chuyển tới cổng thanh toán...")
- Toàn page có thể hiện overlay nhẹ (`LoadingOverlay` component có sẵn) để ngăn user click nút khác

---

## 5. Trang Payment Result

> **Route**: `/(main)/checkout/payment-result/page.tsx`
>
> **Mục đích**: VNPAY callback redirect về đây với query params kết quả. Hiển thị trạng thái thanh toán.

### Query params từ VNPAY (ví dụ)

Backend sẽ xử lý callback từ VNPAY và redirect user về frontend URL này kèm params, hoặc frontend đọc params để hiển thị.

### Giao diện — Thành công

```
┌──────────────────────────────────────────────┐
│         ✅  THANH TOÁN THÀNH CÔNG             │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │  Mã đơn hàng:    #ORD-xxxxxxx          │  │
│  │  Số tiền:         xxx.xxx đ              │  │
│  │  Phương thức:     VNPAY                  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  [🔍 Xem đơn hàng]        (primary)         │
│  [🛒 Tiếp tục mua sắm]   (outline)         │
└──────────────────────────────────────────────┘
```

### Giao diện — Thất bại

```
┌──────────────────────────────────────────────┐
│         ❌  THANH TOÁN THẤT BẠI               │
│                                               │
│  Giao dịch không thành công. Vui lòng thử    │
│  lại hoặc chọn phương thức thanh toán khác.   │
│                                               │
│  [🔄 Thử lại thanh toán]  (primary)         │
│  [🔍 Xem đơn hàng]        (outline)         │
│  [🏠 Về trang chủ]        (ghost)           │
└──────────────────────────────────────────────┘
```

### Logic

- Đọc query params (`order_id`, `status` hoặc tương tự từ backend redirect)
- Gọi `orderApi.getOrderDetail(orderId)` để verify `payment_status`
- Nếu `payment_status === "PAID"` → hiện UI thành công
- Nếu `payment_status === "FAILED"` hoặc `"PENDING"` → hiện UI thất bại
- "Thử lại" → gọi lại `paymentApi.createPayment` → redirect VNPAY

---

## 6. Cấu trúc thư mục & Route

### Routes (App Router)

```
frontend/src/app/
├── checkout/
│   ├── page.tsx                    ← Trang checkout chính
│   ├── test/
│   │   └── page.tsx                ← Trang test entry (dev-only / không phải flow chính)
│   ├── success/
│   │   └── page.tsx                ← Trang đặt hàng thành công
│   └── payment-result/
│       └── page.tsx                ← Trang kết quả thanh toán (VNPAY callback)
├── user/
│   └── cart/
│       └── page.tsx                ← Flow chính: giỏ hàng thật, chọn item để checkout
```

### Feature Components

```
frontend/src/features/orders/
├── api/index.ts                    ✅ Đã có
├── types/index.ts                  ✅ Đã có
├── hooks/
│   ├── useCheckoutPreview.ts       🆕 Hook gọi checkout preview
│   ├── useCreateOrder.ts           🆕 Hook gọi create order
│   └── index.ts
├── stores/
│   └── useCheckoutStore.ts         🆕 Zustand store giữ checkout state
├── components/
│   ├── CheckoutItemList.tsx        🆕 Danh sách SP preview
│   ├── PaymentMethodSelector.tsx   🆕 Radio chọn PTTT
│   ├── OrderSummaryCard.tsx        🆕 Card tóm tắt (sidebar)
│   ├── OrderSuccessCard.tsx        🆕 Card kết quả đặt hàng
│   └── index.ts
└── schemas/
    └── checkoutSchema.ts           🆕 Zod schema validate (nếu cần)

frontend/src/features/payment/
├── api/index.ts                    ✅ Đã có
├── types/index.ts                  ✅ Đã có
├── hooks/
│   ├── useCreatePayment.ts         🆕 Hook gọi create payment
│   └── index.ts
└── components/
    ├── PaymentResultCard.tsx        🆕 Card kết quả thanh toán
    └── index.ts
```

---

## 7. Shared Components cần xây thêm

> Các component UI chung có thể tái sử dụng, đặt ở `@/components/ui/`

| Component | Vị trí | Mô tả |
|---|---|---|
| `RadioCard` | `ui/radio/RadioCard.tsx` | Card-style radio button (dùng cho payment method selector) |

> **Lưu ý**: Các component đã có sẵn và tái dùng được:
> - `Button` — cho các CTA
> - `Modal` — cho AddressSelector
> - `TextArea` — cho ghi chú
> - `LoadingSpinner`, `LoadingOverlay` — cho loading states
> - `AddressSelector`, `AddressList`, `AddressFormDialog` — cho chọn địa chỉ

---

## 8. Hooks & Stores cần xây

### Hooks (TanStack React Query)

#### `useCheckoutPreview`

```ts
// Input: CheckoutPreviewRequest
// Output: CheckoutPreviewResponse (items + subtotal)
// Gọi: orderApi.getCheckoutPreview
// Cache key: ["checkout-preview", payload]
```

#### `useCreateOrder`

```ts
// Mutation hook
// Input: CreateOrderRequest
// Output: OrderCreateResponse
// Gọi: orderApi.createOrder
// onSuccess: redirect tới success page, clear checkout store, invalidate cart query
// onError: toast error
```

#### `useCreatePayment`

```ts
// Mutation hook
// Input: CreatePaymentRequest (order_id)
// Output: CreatePaymentResponse (payment_url, ...)
// Gọi: paymentApi.createPayment
// onSuccess: redirect tới payment_url
// onError: toast error
```

### Store (Zustand)

#### `useCheckoutStore`

```ts
interface CheckoutState {
    // Data truyền từ test page hoặc từ cart/product page
    checkoutType: CheckoutType | null;
    buyNowItem: BuyNowItem | null;
    cartItemIds: number[] | null;

    // Selections
    selectedAddressId: number | null;
    selectedPaymentMethod: PaymentMethod | null;
    note: string;

    // Actions
    setCheckoutData: (type: CheckoutType, buyNow?: BuyNowItem, cartIds?: number[]) => void;
    setSelectedAddress: (addressId: number) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    setNote: (note: string) => void;
    reset: () => void;
}
```

---

## 9. Thứ tự triển khai

### Phase 1 — Nền tảng (Hooks, Store, Components con)

| # | Task | File(s) | Phụ thuộc |
|---|---|---|---|
| 1.1 | Tạo `useCheckoutStore` | `orders/stores/useCheckoutStore.ts` | — |
| 1.2 | Tạo `useCheckoutPreview` hook | `orders/hooks/useCheckoutPreview.ts` | order API |
| 1.3 | Tạo `useCreateOrder` hook | `orders/hooks/useCreateOrder.ts` | order API |
| 1.4 | Tạo `useCreatePayment` hook | `payment/hooks/useCreatePayment.ts` | payment API |
| 1.5 | Tạo `RadioCard` component | `components/ui/radio/RadioCard.tsx` | — |

### Phase 2 — Feature Components

| # | Task | File(s) | Phụ thuộc |
|---|---|---|---|
| 2.1 | Tạo `CheckoutItemList` | `orders/components/CheckoutItemList.tsx` | types |
| 2.2 | Tạo `PaymentMethodSelector` | `orders/components/PaymentMethodSelector.tsx` | RadioCard, types |
| 2.3 | Tạo `OrderSummaryCard` | `orders/components/OrderSummaryCard.tsx` | types |
| 2.4 | Tạo `OrderSuccessCard` | `orders/components/OrderSuccessCard.tsx` | types |
| 2.5 | Tạo `PaymentResultCard` | `payment/components/PaymentResultCard.tsx` | types |

### Phase 3 — Pages

| # | Task | File(s) | Phụ thuộc |
|---|---|---|---|
| 3.1 | Tạo **Test Entry** page (dev-only) | `app/(main)/checkout/test/page.tsx` | Store |
| 3.2 | Tạo **Checkout** page | `app/(main)/checkout/page.tsx` | Phase 1 + 2 + AddressSelector |
| 3.3 | Tạo **Order Success** page | `app/(main)/checkout/success/page.tsx` | Phase 1 + 2 |
| 3.4 | Tạo **Payment Result** page | `app/(main)/checkout/payment-result/page.tsx` | Phase 1 + 2 |
| 3.5 | Nối flow chính từ **giỏ hàng thật** | `app/user/cart/page.tsx` → `app/checkout/page.tsx` | Cart + query params |

### Phase 4 — Polish & Test

| # | Task |
|---|---|
| 4.1 | Mobile responsive cho checkout page |
| 4.2 | Loading / error / empty states |
| 4.3 | Edge cases: không có địa chỉ, preview lỗi, order fail |
| 4.4 | Test end-to-end flow với 2 kịch bản (BUY_NOW, CART thật từ `/user/cart`) |

---

## Design Tokens sử dụng

| Token (Tailwind class) | Dùng cho |
|---|---|
| `bg-surface-card` / `border-surface-border` | Card containers |
| `bg-primary` / `hover:bg-primary-hover` / `text-primary-contrast` | Primary buttons |
| `bg-primary-light` / `text-primary` | Selected states, badges |
| `text-text-main` / `text-text-sub` / `text-text-muted` | Hierarchy text |
| `bg-status-success-bg` / `text-status-success` | Success states (✅) |
| `bg-status-error-bg` / `text-status-error` | Error states (❌) |
| `shadow-brand-sm` / `shadow-brand-md` | Card elevation |
| `ring-brand` | Focus rings |

---

## Tham chiếu module đã có

| Module | File | Trạng thái |
|---|---|---|
| Order Types | [`orders/types/index.ts`](file:///e:/Projects/shop-app-platform/frontend/src/features/orders/types/index.ts) | ✅ Đầy đủ |
| Order API | [`orders/api/index.ts`](file:///e:/Projects/shop-app-platform/frontend/src/features/orders/api/index.ts) | ✅ Đầy đủ |
| Payment Types | [`payment/types/index.ts`](file:///e:/Projects/shop-app-platform/frontend/src/features/payment/types/index.ts) | ✅ Đầy đủ |
| Payment API | [`payment/api/index.ts`](file:///e:/Projects/shop-app-platform/frontend/src/features/payment/api/index.ts) | ✅ Đầy đủ |
| Shipping Address | [`shipping-address/`](file:///e:/Projects/shop-app-platform/frontend/src/features/shipping-address) | ✅ Types + API + Components + Hooks + Store |
| Cart | [`cart/`](file:///e:/Projects/shop-app-platform/frontend/src/features/cart) | ✅ Types + API (cần hooks nếu muốn invalidate) |
| UI Components | [`components/ui/`](file:///e:/Projects/shop-app-platform/frontend/src/components/ui) | ✅ Button, Modal, Input, Loading, Pagination, Toast |
| CSS Tokens | [`globals.css`](file:///e:/Projects/shop-app-platform/frontend/src/app/globals.css) | ✅ Full design system |
