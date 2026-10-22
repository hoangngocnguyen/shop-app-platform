# TÀI LIỆU THIẾT KẾ & HƯỚNG DẪN TRIỂN KHAI MODULE PAYMENTS (INSTRUMENT)

> **Mục tiêu**: Xây dựng module `payments` độc lập, tập trung điều phối các hình thức thanh toán (hiện tại: **VNPAY** và **COD**), tái sử dụng trực tiếp enums từ `orders`, tuân thủ nguyên lý Single Responsibility (SRP) và tối ưu trải nghiệm cho Frontend.

---

## 1. PHÂN TÍCH & PHẢN BIỆN KIẾN TRÚC (BRAINSTORMING & CRITIQUE)

### 1.1. Tái sử dụng Enums sẵn có
- Hệ thống đã có sẵn `PaymentMethod` và `PaymentStatus` trong `src/app/modules/orders/enums/order_enums.py`:
  - `PaymentMethod`: `COD`, `VNPAY`, `BANK_TRANSFER`.
  - `PaymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`.
- **Tối ưu**: Module `payments` nhập trực tiếp các Enum này, **không tạo file `enums.py` riêng** nhằm tránh trùng lặp và phân mảnh định nghĩa trong toàn bộ hệ thống.

### 1.2. Phân tầng và Ranh giới nghiệp vụ
- **Tầng Provider (`payments/vnpay/`)**: Là pure technical adapter, xử lý HMAC SHA512, checksum, parse URL/IPN, tuyệt đối không phụ thuộc vào `Order`.
- **Tầng Orchestrator (`PaymentService` tại `payments/service.py`)**:
  - Nhận `order_id` từ client, kiểm tra quyền sở hữu (`user_id`).
  - Kiểm tra trạng thái đơn: không cho phép thanh toán đơn đã `CANCELLED`, `COMPLETED` hoặc `PAID`.
  - Lấy `order.total` trực tiếp từ CSDL (chống gian lận số tiền từ phía client).
  - Khởi tạo link thanh toán VNPAY hoặc xác nhận thanh toán COD.
  - Xử lý Webhook IPN và Return URL để cập nhật trạng thái đơn sang `PAID` và ghi log lịch sử.

### 1.3. Khắc phục lỗi trùng mã giao dịch VNPAY (`vnp_TxnRef`)
- Khi khách hàng thanh toán lần 1 thất bại và bấm "Thanh toán lại", nếu dùng nguyên `order_id` thì VNPAY sẽ báo lỗi "Mã giao dịch đã tồn tại".
- **Giải pháp**: Gửi `vnp_TxnRef = f"{order_id}_{int(time.time())}"`. Khi nhận kết quả từ IPN hoặc Return URL, chỉ cần tách chuỗi: `order_id = txn_ref.split("_")[0]`.

### 1.4. Phản biện: Tại sao `create-payment` CHỈ NÊN nhận duy nhất `order_id`?
- **Vấn đề khi nhận cả `payment_method` trong `create-payment`**:
  1. **Vi phạm nguyên lý Đơn trách nhiệm (SRP)**: Endpoint khởi tạo thanh toán chỉ nên làm nhiệm vụ *thực thi giao dịch* dựa trên trạng thái đơn hàng đã chốt lúc Checkout. Nếu cho phép đổi phương thức ngay tại đây, API vừa thanh toán vừa kiêm chỉnh sửa cấu trúc đơn hàng (gây side-effect ngầm).
  2. **Rủi ro phá vỡ tính toàn vẹn giá / khuyến mại**: Trong e-commerce, nhiều mã giảm giá hoặc chính sách phí ship gắn liền với phương thức thanh toán (ví dụ: voucher độc quyền khi thanh toán online VNPAY, miễn phí vận chuyển qua thẻ). Nếu cho phép đổi tự do sang COD ở bước thanh toán mà không tính toán lại giỏ hàng / voucher, hệ thống sẽ bị thất thoát tài chính.
  3. **Idempotency & Cache**: Client gọi lại API tạo thanh toán nhiều lần không được làm thay đổi thuộc tính của đơn hàng trong CSDL.
- **Quyết định kiến trúc**:
  - `POST /api/v1/payments/create-payment` **chỉ nhận duy nhất `order_id`**.
  - Backend tự đọc `order.payment_method` đã lưu trong database:
    - Nếu là `VNPAY`: Sinh link thanh toán VNPAY và trả về `payment_url`.
    - Nếu là `COD`: Trả về `payment_url = None` cùng hướng dẫn đơn hàng COD.
    - Nếu là phương thức khác chưa hỗ trợ: Báo lỗi nghiệp vụ `400 Bad Request`.
  - **Kế hoạch mở rộng**: Nếu sau này muốn cho khách đổi phương thức (ví dụ: VNPAY lỗi muốn chuyển về COD), đó phải là một API riêng biệt thuộc module `orders` (`PATCH /api/v1/orders/{order_id}/payment-method`) để kiểm tra lại điều kiện khuyến mãi và ghi log kiểm toán rõ ràng.

---

## 2. CẤU TRÚC THƯ MỤC MODULE `payments`

```text
backend/src/app/modules/payments/
├── __init__.py               # Xuất PaymentService, router, schemas
├── schemas.py                # CreatePaymentRequest & CreatePaymentResponse
├── router.py                 # Router tổng của payments (gom vnpay và endpoint /create-payment)
├── service.py                # PaymentService (Orchestrator kết nối orders và VNPAY)
├── instrument.md             # Tài liệu thiết kế kiến trúc (File hiện tại)
└── vnpay/                    # Provider VNPAY
    ├── __init__.py
    ├── router.py             # Endpoint return & ipn callback riêng của VNPAY
    ├── schemas.py            # Schemas đặc thù của VNPAY
    └── service.py            # VNPayService xử lý tính hash, verify checksum, build URL
```

---

## 3. SCHEMAS ĐẶC TẢ (`payments/schemas.py`)

```python
from decimal import Decimal
from pydantic import BaseModel, Field
from src.app.modules.orders.enums.order_enums import PaymentMethod


class CreatePaymentRequest(BaseModel):
    """Payload chỉ nhận duy nhất order_id."""
    order_id: str = Field(
        ..., 
        min_length=1, 
        description="Mã đơn hàng cần thanh toán",
        examples=["OD123456"]
    )


class CreatePaymentResponse(BaseModel):
    """Dữ liệu phản hồi sau khi khởi tạo thanh toán."""
    order_id: str = Field(..., description="Mã đơn hàng")
    payment_method: PaymentMethod = Field(..., description="Phương thức thanh toán áp dụng của đơn")
    amount: Decimal = Field(..., description="Tổng giá trị đơn hàng cần thanh toán")
    payment_url: str | None = Field(default=None, description="URL thanh toán (đối với VNPAY)")
    message: str = Field(..., description="Thông báo kết quả khởi tạo")
```

---

## 4. LUỒNG XỬ LÝ (FLOW & SERVICES)

### 4.1. Endpoint Tạo Thanh Toán: `POST /api/v1/payments/create-payment`
1. Client gửi:
   ```json
   {
     "order_id": "OD123456"
   }
   ```
2. Backend xác thực người dùng và kiểm tra đơn hàng:
   - Đơn hàng tồn tại (`404 Not Found` nếu không tìm thấy).
   - Đơn hàng thuộc quyền sở hữu của `current_user_id` (`403 Forbidden` nếu sai).
   - Đơn hàng chưa bị hủy (`CANCELLED`) hoặc hoàn thành (`COMPLETED`).
   - Đơn hàng chưa thanh toán (`payment_status != PAID`).
3. Backend đọc `current_method = order.payment_method`:
   - Nếu là **`VNPAY`**:
     - Sinh `txn_ref = f"{order_id}_{int(time.time())}"`.
     - Sinh link VNPAY với số tiền `int(order.total)` và nội dung `Thanh toan don hang {order_id}`.
     - Trả về `payment_url` để Frontend `window.location.href = payment_url`.
   - Nếu là **`COD`**:
     - Trả về `payment_url = None` cùng message xác nhận đơn hàng COD để Frontend chuyển sang trang hoàn tất đặt hàng.
   - Nếu phương thức khác:
     - Báo lỗi `400 Bad Request` (`UNSUPPORTED_PAYMENT_METHOD`).

### 4.2. Xử lý IPN & Return URL
- Xác thực checksum bí mật SHA512.
- Trích xuất `order_id` từ `vnp_TxnRef`.
- Đối chiếu số tiền `vnp_Amount` với `order.total`.
- Khi kết quả thành công (`ResponseCode == "00"`):
  - Chuyển `order.payment_status = "PAID"`.
  - Cập nhật `order.payment_date = datetime.now(UTC)`.
  - Ghi nhật ký vào `order_logs`.

---

## 5. CHECKLIST ĐÃ TRIỂN KHAI (COMPLETED)
1. [x] Sửa [payments/schemas.py](file:///e:/Projects/shop-app-platform/backend/src/app/modules/payments/schemas.py): Bỏ trường `payment_method` trong `CreatePaymentRequest`, chỉ nhận `order_id`.
2. [x] Sửa [payments/service.py](file:///e:/Projects/shop-app-platform/backend/src/app/modules/payments/service.py): Bỏ logic mutate `order.payment_method`, tự động đọc phương thức từ đơn hàng trong CSDL.
3. [x] Cập nhật [payments/router.py](file:///e:/Projects/shop-app-platform/backend/src/app/modules/payments/router.py): Cập nhật docstring và summary của endpoint `/create-payment`.
4. [x] Cập nhật unit test trong [tests/test_payment_service.py](file:///e:/Projects/shop-app-platform/backend/tests/test_payment_service.py): 10/10 test cases vượt qua thành công 100%.
