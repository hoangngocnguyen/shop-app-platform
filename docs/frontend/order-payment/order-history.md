# Kế hoạch xây dựng trang lịch sử đơn hàng

## Mục tiêu

Xây dựng trang lịch sử đơn hàng cho người mua, theo đúng contract backend hiện có ở:
- [backend/src/app/modules/orders/routers/order_router.py](../../../backend/src/app/modules/orders/routers/order_router.py)
- [backend/src/app/modules/orders/schemas/order_schema.py](../../../backend/src/app/modules/orders/schemas/order_schema.py)

Mục tiêu chính:
- Hiển thị danh sách đơn hàng theo trạng thái
- Hỗ trợ mở rộng/thu gọn từng đơn hàng để xem chi tiết sản phẩm
- Dễ mở rộng khi backend thay đổi enum/status
- Có thiết kế responsive tốt, linh hoạt theo màn hình
- Có API layer rõ ràng và cấu trúc frontend hợp lý

---

## 1. Dữ liệu backend cần dùng

### Endpoint chính

1. `GET /api/v1/orders`
   - dùng để lấy danh sách đơn hàng của người dùng
   - hỗ trợ lọc theo `orderStatus`, `search`, `page`, `limit`

2. `GET /api/v1/orders/{order_id}`
   - dùng để lấy chi tiết đơn hàng khi mở expand hoặc xem chi tiết

3. `PATCH /api/v1/orders/{order_id}/complete`
   - xác nhận đã nhận hàng, chuyển trạng thái thành `COMPLETED`
   - đây là action quan trọng trên card đơn hàng khi trạng thái hiện tại cho phép xác nhận nhận hàng

4. `PATCH /api/v1/orders/{order_id}/cancel`
   - khách hàng hủy đơn và gửi lý do từ reason catalog
   - payload bắt buộc có `reason_code`, có thể có `custom_reason` nếu chọn `OTHER`
   - cần dùng catalog hủy từ `GET /api/v1/orders/cancellation-reasons`

5. `POST /api/v1/orders/{order_id}/reorder`
   - tái tạo snapshot mua lại từ đơn cũ

> Lưu ý quan trọng: các action hủy đơn và xác nhận đơn đã được backend khai báo sẵn ở [backend/src/app/modules/orders/routers/order_router.py](../../../backend/src/app/modules/orders/routers/order_router.py), schema request/response tương ứng đã có ở [backend/src/app/modules/orders/schemas/order_requests.py](../../../backend/src/app/modules/orders/schemas/order_requests.py) và [backend/src/app/modules/orders/schemas/order_responses.py](../../../backend/src/app/modules/orders/schemas/order_responses.py). Frontend module `orders` cũng đã có API + type tương ứng ở [frontend/src/features/orders/api/index.ts](../../../frontend/src/features/orders/api/index.ts) và [frontend/src/features/orders/types/index.ts](../../../frontend/src/features/orders/types/index.ts). Vì vậy, khi xây trang lịch sử đơn hàng, không cần tự invent schema mới; chỉ cần bind đúng các action đã có sẵn.

### Schema cần map đúng

Các schema backend quan trọng:
- `OrderSummaryResponse`
- `OrderDetailResponse`
- `OrderListResponse`
- `OrderActionResponse`
- `OrderLogResponse`
- `OrderItemSummaryResponse`

Các trường cần ưu tiên:
- `order_id`
- `status`
- `payment_method`
- `payment_status`
- `total_amount`
- `created_at`
- `items`
- `cancel_reason`
- `cancelled_by_type`
- `order_logs`

---

## 2. Nguyên tắc kỹ thuật quan trọng

### 2.1 Không hardcode enum status trong UI

Không nên viết như:
- `status === "PENDING"`
- `status === "CANCELLED"`
- `status: "PENDING"`

Thay vào đó, frontend cần có một nguồn dữ liệu chuẩn duy nhất, ví dụ:
- `ORDER_STATUS`
- `PAYMENT_STATUS`
- `ORDER_STATUS_LABELS`
- `PAYMENT_STATUS_LABELS`

Mục tiêu:
- khi backend đổi tên enum hoặc thêm trạng thái mới, chỉ sửa map ở 1 nơi
- component không phải sửa nhiều chỗ

### 2.2 Tách riêng value và label

- `value`: giá trị enum/backend, ví dụ `PENDING`
- `label`: text hiển thị, ví dụ `Đang chờ xử lý`

Ví dụ:
- `ORDER_STATUS.PENDING` => `"PENDING"`
- `ORDER_STATUS_LABELS[ORDER_STATUS.PENDING]` => `"Đang chờ xử lý"`

---

## 3. Cấu trúc frontend đề xuất

```text
frontend/src/
  features/
    orders/
      api/
        orderApi.ts
      components/
        OrderHistoryTabs.tsx
        OrderHistoryList.tsx
        OrderHistoryCard.tsx
        OrderHistoryItemRow.tsx
        OrderHistoryExpandPanel.tsx
        LoadMoreButton.tsx
      hooks/
        useOrderHistory.ts
        useOrderDetail.ts
      types/
        index.ts
      utils/
        orderStatus.ts
  app/
    user/
      orders/
        page.tsx
```

### Mục đích từng phần:

- `types/index.ts`
  - định nghĩa enum, type, map label, helper

- `orderApi.ts`
  - wrapper cho tất cả endpoint liên quan đến order

- `hooks/useOrderHistory.ts`
  - quản lý fetch list, state filter, load more

- `OrderHistoryTabs.tsx`
  - render tabs trạng thái ngang

- `OrderHistoryList.tsx`
  - render toàn bộ danh sách đơn hàng

- `OrderHistoryCard.tsx`
  - card tổng quan cho 1 đơn hàng

- `OrderHistoryItemRow.tsx`
  - render từng sản phẩm ở view mở rộng/thu gọn

- `LoadMoreButton.tsx`
  - component phân trang kiểu “xem thêm” thay vì chọn trang số

---

## 4. Giao diện đề xuất

### 4.1 Tab trạng thái

Render trên 1 hàng ngang, ví dụ:
- Tất cả
- Chờ xử lý
- Đang xử lý
- Đang giao hàng
- Đã giao
- Hoàn thành
- Đã hủy
- Trả hàng

Yêu cầu:
- tab active rõ ràng
- có count nếu cần, nhưng không bắt buộc
- giao diện responsive: trên mobile tab có thể scroll ngang

### 4.2 Card đơn hàng

Mỗi card chứa:
- ngày đặt
- mã đơn
- trạng thái
- tổng tiền
- 1 sản phẩm đầu tiên preview
- nút mở rộng/thu gọn

Thông tin hiển thị thiết yếu:
- `created_at`
- `order_id`
- `status`
- `total_amount`
- `items[0]`

### 4.3 Mở rộng chi tiết đơn hàng

Khi mở card:
- hiển thị danh sách sản phẩm đầy đủ
- mỗi sản phẩm có:
  - ảnh
  - tên sản phẩm
  - giá gốc (nhạt, gạch ngang)
  - giá lúc mua
  - số lượng
  - thành tiền
- có thể hiển thị thêm:
  - địa chỉ nhận hàng
  - ghi chú
  - trạng thái thanh toán
  - log trạng thái

### 4.4 Responsive

- mobile: card xếp dọc, preview item 1 cột, nút mở rộng full width
- tablet: 2 cột metadata, sản phẩm nổi bật rõ hơn
- desktop: card rộng, panel mở rộng có layout 2 cột nếu cần

---

## 5. Phương án phân trang / “xem thêm”

Nên dùng kiểu “Load more” thay vì paging số trang vì UX tốt hơn với lịch sử đơn hàng:

### Cách làm

- initial request: `page=1&limit=5`
- mỗi click “Xem thêm”: tăng `page` lên 1
- append dữ liệu vào `items`
- khi `items.length < total_items` => hiển thị button xem thêm

### Gợi ý component chung

```tsx
<LoadMoreButton
  isLoading={isLoadingMore}
  hasMore={hasMore}
  onLoadMore={handleLoadMore}
/>
```

### Đặc điểm:
- tránh paging số trang phức tạp
- good for mobile và desktop
- dễ tái sử dụng trên các trang khác như wishlist, recent orders, payment history

---

## 6. UI color và text styling

Ngoài việc lấy token từ global theme, nên định nghĩa thêm color scheme theo logic nghiệp vụ.

### 6.1 Status color
- PENDING: amber / warning
- PROCESSING: blue / info
- SHIPPING: indigo
- DELIVERED: teal
- COMPLETED: green / success
- CANCELLED: red / danger
- RETURNED: orange / muted warning

### 6.2 Price color
- original price: `text-text-muted` + `line-through`
- sale/current price: `text-text-main` + `font-bold`
- total price: `text-primary` hoặc `text-text-main` rõ hơn
- discount: màu success/warning nếu có hiển thị

### 6.3 Hệ thống nên dùng class map thay vì hardcode trực tiếp
Ví dụ:

```ts
const STATUS_STYLES = {
  PENDING: "bg-warning-soft text-warning",
  PROCESSING: "bg-info-soft text-info",
  CANCELLED: "bg-danger-soft text-danger",
};
```

Như vậy, khi đổi theme hoặc backend enum, chỉ cần sửa `config` chứ không phải sửa UI ở nhiều nơi.

---

## 7. Triển khai theo từng bước

### Bước 1: Thiết lập type + enum map
- định nghĩa `ORDER_STATUS`, `PAYMENT_STATUS`
- định nghĩa `ORDER_STATUS_LABELS`, `PAYMENT_STATUS_LABELS`
- đảm bảo UI dùng mapping thay vì giá trị string điển hình

### Bước 2: API layer
- xây `orderApi.ts`
- include methods: `getOrders`, `getOrderDetail`, `cancelOrder`, `completeOrder`, `reorder`
- chuẩn hóa `ApiResponse<T>`
- đặc biệt ưu tiên các action này theo contract đã có sẵn trong module order, tránh viết lại payload/schema khác với backend
- `completeOrder(orderId)` -> `PATCH /api/v1/orders/{order_id}/complete`
- `cancelOrder(orderId, payload)` -> `PATCH /api/v1/orders/{order_id}/cancel`
- `getCancellationReasons()` -> `GET /api/v1/orders/cancellation-reasons`

> Đây là phần cần “gắn trực tiếp” vào UI card: button hủy đơn, xác nhận đã nhận hàng, và modal chọn lý do hủy theo reason catalog.

### Bước 3: Hook trạng thái
- `useOrderHistory` quản lý danh sách, filter, loading, load more
- `useOrderDetail` quản lý mở chi tiết đơn hàng nếu cần

### Bước 4: Component list
- `OrderHistoryTabs`
- `OrderHistoryList`
- `OrderHistoryCard`
- `OrderHistoryExpandPanel`
- `LoadMoreButton`
- `OrderActionBar` hoặc tích hợp action trực tiếp vào `OrderHistoryCard`:
  - `onCompleteOrder(orderId)` cho xác nhận nhận hàng
  - `onCancelOrder(orderId, payload)` cho hủy đơn
  - hiển thị reason catalog modal trước khi gọi cancel API

> Các action này là phần chức năng nghiệp vụ bắt buộc của trang lịch sử đơn hàng, không nên xem như phụ kiện. Nếu card đang ở trạng thái `PENDING` / `PROCESSING`, nên cho phép hủy; nếu `DELIVERED` / `SHIPPING`, nên cho phép xác nhận đã nhận hàng.

### Bước 5: Page chính
- page `frontend/src/app/user/orders/page.tsx`
- gồm header, tabs, list, empty state, load more

### Bước 6: Kiểm tra UX
- empty state khi không có đơn hàng
- loading state khi fetch
- error state khi API lỗi
- responsive trên mobile/tablet/desktop

---

## 8. Các lưu ý quan trọng khi xây dựng

1. Không để logic thành tiền và logic trạng thái rải rác trong component.
2. Dùng `order_status` mapping và `price formatting` utility riêng.
3. Nên chuẩn hóa dữ liệu datetime thành format hiển thị tiếng Việt.
4. Nên có component `OrderStatusBadge` để tái dùng trên toàn frontend.
5. Nên có `PriceText` hoặc `MoneyDisplay` component để đồng nhất giá trên tất cả màn hình.
6. Khi có nhiều card, cần tối ưu render bằng memoization nếu dữ liệu lớn.

---

## 9. Kết luận

Trang lịch sử đơn hàng nên được xây dựng theo hướng:
- đúng contract API backend
- không hardcode enum value
- dùng mapping trung tâm cho status và màu sắc
- giao diện card + expand + load more
- cấu trúc frontend rõ ràng, dễ mở rộng khi có thêm chức năng như hoàn hàng, theo dõi vận chuyển, hoặc xem chi tiết timeline

Đây là hướng phù hợp nhất với dữ liệu mà backend đang cung cấp ở [backend/src/app/modules/orders/routers/order_router.py](../../../backend/src/app/modules/orders/routers/order_router.py) và [backend/src/app/modules/orders/schemas/order_schema.py](../../../backend/src/app/modules/orders/schemas/order_schema.py).


`LoadMoreButton` nên có:
- `hasMore: boolean`
- `isLoading: boolean`
- `onLoadMore: () => void`

Dùng lại được cho các danh sách khác trong project nếu cần.

---

## 6. API frontend cần định nghĩa

### `orderApi.ts`

Các hàm cần có:

```ts
getOrders(params)
getOrderDetail(orderId)
completeOrder(orderId)
cancelOrder(orderId, payload)
reorder(orderId)
```

### Mẫu response handling

- parse `ApiResponse<T>`
- trả dữ liệu `data`
- ném lỗi nếu `success === false`
- chuẩn hóa dữ liệu để tránh component xử lý format quá nhiều

---

## 7. Quy tắc style và màu sắc

### Màu trạng thái đơn hàng

- `PENDING`: amber / vàng chờ
- `PROCESSING`: blue / xanh dương
- `SHIPPING`: indigo / tím nhạt
- `DELIVERED`: teal / xanh ngọc
- `COMPLETED`: green / xanh lá
- `CANCELLED`: red / đỏ
- `RETURNED`: gray / xám

### Màu giá

- giá gốc: `text-muted` và `line-through`
- giá lúc mua: `text-main` + `font-semibold`
- thành tiền: `text-main` / `primary`
- giảm giá nếu có: `success` hoặc `warning`

### Kỹ thuật:

- dùng token global của project thay vì hex lẻ tẻ
- map trạng thái sang class màu trong helper riêng
- không đặt color trực tiếp thẳng trong component nếu có thể tránh

---

## 8. Quy trình triển khai thực tế

### Bước 1: Tạo model và helper status
- định nghĩa enum/status map
- định nghĩa label và màu theo status

### Bước 2: Tạo API layer
- `orderApi.ts`
- xử lý query params, response, error

### Bước 3: Hook quản lý dữ liệu
- `useOrderHistory.ts`
- `useOrderDetail.ts`

### Bước 4: Tạo component tab + card
- `OrderHistoryTabs.tsx`
- `OrderHistoryCard.tsx`

### Bước 5: Tạo expand detail panel
- `OrderHistoryExpandPanel.tsx`
- `OrderHistoryItemRow.tsx`

### Bước 6: Tạo page chính
- `frontend/src/app/user/orders/page.tsx`

### Bước 7: Tạo empty-state / loading / error-state
- không để page trắng khi dữ liệu trống

### Bước 8: Responsive + polish
- spacing, border, badge, typography
- tối ưu mobile và desktop

---

## 9. Ưu tiên triển khai tốt nhất

### Ưu tiên cao
- đúng schema backend
- tab trạng thái
- card đơn hàng + expand panel
- load more
- responsive

### Ưu tiên vừa
- filter search
- chi tiết order log
- trạng thái thanh toán
- reorder action
- action hủy đơn theo reason catalog và xác nhận nhận hàng theo flow backend đã chuẩn hóa

> Cả hai action này nên nằm trong ưu tiên cao hơn một chút vì đã có contract backend nằm sẵn và là tính năng cốt lõi của trang order history.

### Ưu tiên thấp
- animation mở rộng nâng cao
- các tính năng phụ xem trước số lượng, badge, mini-chart

---

## 10. Kết luận

Trang lịch sử đơn hàng nên được xây theo hướng:
- domain order rõ ràng
- API layer tách biệt
- status centralize ở map chuẩn
- UI theo cấu trúc tab + card + expand + load more
- responsive tốt
- dùng token màu global và mapping trạng thái màu sắc

Điều quan trọng nhất là không để UI tự hardcode enum/literal status ở nhiều nơi, vì khi backend đổi status hoặc thêm status mới, hệ thống sẽ dễ vỡ. Cần dùng một nguồn giá trị thống nhất trong frontend, và lấy label/màu sắc thông qua helper/map.
