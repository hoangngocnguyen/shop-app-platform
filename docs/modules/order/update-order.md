# Kế hoạch Triển khai: Badge Đếm Trạng thái Đơn hàng & Tối ưu UX/UI Order History

Tài liệu thiết kế kỹ thuật tinh gọn cho việc hiển thị số lượng đơn hàng theo trạng thái trên thanh Tabs và tối ưu trải nghiệm tương tác mở xem chi tiết đơn hàng tại `/user/orders`.

---

## 1. Mục tiêu Cốt lõi
1. **Hiển thị Badge số lượng trên Tabs:** Tự động hiển thị số đơn hàng tương ứng theo các trạng thái (`ALL`, `PENDING`, `PROCESSING`, `SHIPPING`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `RETURNED`).
2. **Kiến trúc API tối ưu (1 Request duy nhất):** Nhúng trực tiếp `status_counts` vào `OrderListResponse` của endpoint `GET /api/v1/orders`. Không sinh thêm endpoint phụ, không spam nhiều request phân trang.
3. **Tối ưu UX/UI Danh sách & Xem chi tiết:** Mở rộng vùng click (click mã đơn, click card sản phẩm), thêm nút Copy mã đơn, đổi icon điều hướng sang `Eye`/Chi tiết và nâng cấp Modal chi tiết.

---

## 2. Thiết kế Kỹ thuật Backend

### 2.1. Query đếm nhóm tại Repository (`repository.py`)
Thêm hàm đếm số lượng đơn hàng theo từng trạng thái của `current_user`:
```python
def count_orders_by_statuses_for_user(self, user_id: UUID) -> dict[str, int]:
    """Đếm số lượng đơn hàng theo trạng thái của user (GROUP BY trên index user_id)."""
    stmt = (
        select(Order.status, func.count(Order.order_id))
        .where(Order.user_id == user_id)
        .group_by(Order.status)
    )
    rows = self.db.execute(stmt).all()
    return {str(row[0]): int(row[1]) for row in rows}
```

### 2.2. Schema Response (`order_responses.py`)
Mở rộng `OrderListResponse` từ `PaginatedResponse[OrderSummaryResponse]` kèm `status_counts`:
```python
class OrderListResponse(PaginatedResponse[OrderSummaryResponse]):
    """Danh sách đơn hàng phân trang kèm số lượng theo từng trạng thái."""
    status_counts: dict[str, int] = Field(
        default_factory=dict,
        description="Số lượng đơn gom nhóm theo trạng thái (ALL, PENDING, PROCESSING...)",
    )
```

### 2.3. Service Layer (`order_service.py`)
Trong `get_orders()`, truy vấn dữ liệu đơn hàng phân trang kết hợp đếm `status_counts`:
```python
# Lấy danh sách phân trang
orders, total_items, total_pages = self.repository.get_user_orders_paginated(...)
items = [self._map_order_summary(o) for o in orders]

# Lấy thống kê số lượng theo trạng thái
raw_counts = self.repository.count_orders_by_statuses_for_user(user_id=user_id)
status_counts: dict[str, int] = {
    "ALL": sum(raw_counts.values()),
    **{s.value: raw_counts.get(s.value, 0) for s in OrderStatus}
}

return OrderListResponse(
    items=items,
    total=total_items,
    page=page,
    page_size=page_size,
    total_pages=total_pages,
    status_counts=status_counts,
)
```

### 2.4. Router Endpoint (`order_router.py`)
Cập nhật `response_model` của `GET /api/v1/orders` thành `ApiResponse[OrderListResponse]`.

---

## 3. Thiết kế Kỹ thuật Frontend

### 3.1. Types & Client API (`src/features/orders`)
- **`types/index.ts`:**
  ```typescript
  export interface OrderListResponse {
      items: OrderSummaryResponse[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      status_counts?: Partial<Record<OrderStatus | "ALL", number>>;
  }
  ```
- **`api/index.ts`:** Giữ nguyên hàm `orderApi.getOrders()`, tự động nhận `status_counts`.

### 3.2. State Management & Hook (`useOrderHistory.ts` & `page.tsx`)
- Thêm state `statusCounts: Partial<Record<OrderStatus | "ALL", number>>` trong `useOrderHistory`.
- Khi `fetchOrders` thành công, lưu `response.status_counts` vào state.
- Tại `page.tsx`, truyền trực tiếp `statusCounts` vào prop `counts` của `<OrderHistoryTabs />`.

### 3.3. Component Tabs (`OrderHistoryTabs.tsx`)
- Hiển thị badge số lượng cạnh mỗi tab khi `count > 0`. Nếu `count > 99`, hiển thị `99+`.
- Tab active: Badge nền tương phản sáng (`bg-white/20 text-white`).
- Tab inactive: Badge nền xám nhạt tinh tế (`bg-surface-hover text-text-sub`).

---

## 4. Tối ưu UX/UI Danh sách & Xem chi tiết đơn hàng

### 4.1. Mở rộng vùng tương tác (Multi-trigger) trên `OrderHistoryCard.tsx`
1. **Click Mã đơn hàng (`#OD...`):**
   - Chuyển thành link/button phong cách font-mono, hover đổi màu `text-primary underline cursor-pointer`.
   - Bấm vào mở ngay `OrderDetailModal`.
2. **Nút Sao chép mã đơn hàng (Copy Icon Button):**
   - Nút icon `Copy` nhỏ gọn đặt cạnh mã đơn hàng.
   - Bấm vào copy mã đơn vào Clipboard và hiển thị Toast: *"Đã sao chép mã đơn hàng"*.
   - Gọi `e.stopPropagation()` để không vô tình mở modal.
3. **Click toàn bộ Khối tóm tắt sản phẩm:**
   - Khối preview sản phẩm có hover `hover:border-primary/40 hover:bg-surface-hover/40 cursor-pointer`.
   - Bấm vào mở `OrderDetailModal`.
4. **Thay đổi Icon mở rộng:**
   - Thay `ChevronDown`/`ChevronUp` bằng icon **`Eye` (Xem chi tiết)** hoặc **`ArrowRight`** rõ ràng.
5. **Chống nổi bọt sự kiện (`e.stopPropagation()`):**
   - Các nút nghiệp vụ (*Thanh toán ngay*, *Đã nhận hàng*, *Hủy đơn*, *Mua lại*, *Copy mã*) đều bọc `e.stopPropagation()`.

### 4.2. Nâng cấp Modal Chi tiết (`OrderDetailModal`)
- **Stepper Timeline:** Trực quan 5 mốc tiến độ (`Chờ xử lý` ➔ `Đang xử lý` ➔ `Đang giao hàng` ➔ `Đã giao hàng` ➔ `Hoàn thành`).
- **Skeleton Loading:** Thay dòng text "Đang tải..." bằng Skeleton Shimmer UI khi đang fetch chi tiết đơn.
- **Đồng bộ Action Buttons:** Đặt thêm nút *Hủy đơn* (khi ở PENDING) và *Đã nhận hàng* (khi ở SHIPPING/DELIVERED) ngay tại footer của Modal.

### 4.3. Cá nhân hóa Empty State theo Tab
- `PENDING`: "Bạn không có đơn hàng nào đang chờ xử lý."
- `PROCESSING`: "Bạn không có đơn hàng nào đang trong quá trình chuẩn bị."
- `SHIPPING`: "Không có đơn hàng nào đang được giao tới bạn."
- `DELIVERED`: "Chưa có đơn hàng nào đã giao gần đây."

---

## 5. Check-list Triển khai Chi tiết

- [x] **Backend Repository:** Viết `count_orders_by_statuses_for_user(user_id)`.
- [x] **Backend Schema:** Khai báo `OrderListResponse` có trường `status_counts`.
- [x] **Backend Service:** Bổ sung logic tính `status_counts` trong `OrderService.get_orders()`.
- [x] **Backend Router:** Cập nhật `response_model=ApiResponse[OrderListResponse]`.
- [ ] **Frontend Types:** Cập nhật interface `OrderListResponse` trong `types/index.ts`.
- [ ] **Frontend Hook:** Lưu và trả về `statusCounts` trong `useOrderHistory.ts`.
- [ ] **Frontend Page & Tabs:** Truyền `counts` thực tế vào `OrderHistoryTabs.tsx`, xử lý hiển thị badge `99+`.
- [ ] **Frontend Card UX:** Cập nhật `OrderHistoryCard.tsx` (Click Order ID, nút Copy mã, click khối preview, đổi icon sang `Eye`, bọc `stopPropagation`).
- [ ] **Frontend Modal:** Thêm Stepper timeline và action buttons phụ trong `OrderDetailModal.tsx`.
- [ ] **Kiểm thử:** Xác nhận số lượng badge cập nhật đúng sau khi chuyển tab, hủy đơn hoặc xác nhận nhận hàng.
