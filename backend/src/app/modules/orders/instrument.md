# Orders module: enum ownership và cancellation catalog

## Mục tiêu

Tổ chức enum theo đúng vai trò nghiệp vụ, tách định nghĩa enum khỏi Pydantic schema, và cung cấp cho frontend customer danh sách lý do hủy cùng nhãn tiếng Việt từ backend.

## Quyết định định hướng

- Tạo API catalog riêng để lấy danh sách lý do hủy customer và admin. Backend là nguồn chuẩn cho `value`, `label` và metadata của form; mỗi frontend fetch/cache đúng catalog theo vai trò, render nhãn và gửi mã enum.
- Backend tiếp tục xác thực `reason_code` bằng enum, cùng các quy tắc nghiệp vụ như quyền sở hữu, trạng thái đơn được phép hủy và `custom_reason` bắt buộc cho `OTHER`. Catalog chỉ phục vụ UI, không thay validation.
- Catalog customer không bao gồm lý do admin/system. Catalog admin chỉ trả admin reasons, dưới router admin hiện có với `ADMIN`/`STAFF` authorization. System reasons không phải lựa chọn UI và không được trả trong hai catalog.
- Phương thức thanh toán checkout hiện có thể cố định ở frontend. Xem xét API catalog riêng nếu phương thức khả dụng phụ thuộc cấu hình hoặc điều kiện kinh doanh.
- Hệ thống hiện chỉ dùng tiếng Việt; response trả một `label` tiếng Việt, chưa cần cơ chế locale.

## Vì sao dùng catalog API

Catalog trả các cặp như `{ value: "OTHER", label: "Lý do khác" }`, cùng metadata như `requires_custom_reason`. Web/mobile không cần tự duy trì map nhãn riêng; backend có thể chỉnh nhãn và metadata form tại một nơi.

Đổi lại, frontend cần tải catalog trước khi dựng form và cache kết quả. Danh sách ít thay đổi nên chỉ fetch khi vào luồng cần dùng, không gọi lại theo từng render. Endpoint nên theo ngữ cảnh thay vì trả mọi enum; customer endpoint không được trộn admin/system choices.

`CANCEL_REASON_TEXT` hiện được backend dùng để ghi/hiển thị lý do hủy dễ đọc trong đơn hàng và audit. Catalog nên dùng cùng nguồn nhãn này hoặc refactor thành một định nghĩa catalog duy nhất, tránh hai map nhãn độc lập trong backend. Backend vẫn validate request kể cả khi frontend lấy choices từ API.

## API catalogs đề xuất

```http
GET /api/v1/orders/cancellation-reasons
```

Response bọc trong `ApiResponse` chuẩn; payload:

```json
{
  "items": [
    {
      "value": "CHANGE_OF_MIND",
      "label": "Đổi ý / Không còn nhu cầu mua nữa.",
      "requires_custom_reason": false
    },
    {
      "value": "OTHER",
      "label": "Lý do khác",
      "requires_custom_reason": true
    }
  ]
}
```

- `value` khớp `CustomerCancelReason` và là giá trị gửi trong `PATCH /orders/{order_id}/cancel`.
- `label` là nội dung tiếng Việt hiển thị trên giao diện.
- `requires_custom_reason` điều khiển input/UX; backend vẫn kiểm tra lại.
- Backend định nghĩa thứ tự `items`.
- API chỉ trả customer reasons. Admin/system enums không xuất hiện trong response này.
- Endpoint GET không có side effect. Store frontend có thể giữ kết quả trong phiên; nếu sau này catalog được cập nhật độc lập với deploy, cân nhắc cache headers/ETag.

Catalog dành cho giao diện quản trị đặt dưới router admin hiện có:

```http
GET /api/v1/admin/orders/cancellation-reasons
```

- Router hiện đặt `require_any_role(["ADMIN", "STAFF"])` ở cấp router; endpoint mới phải kế thừa bảo vệ này.
- Response dùng cùng shape `items: [{ value, label, requires_custom_reason }]`, nhưng danh sách chỉ sinh từ `AdminCancelReason`.
- Không trả `CustomerCancelReason` hoặc `SystemCancelReason` trong response admin. `OTHER` vẫn đánh dấu cần custom reason vì request admin yêu cầu ghi chú cho mã này.
- Có thể dùng chung response schema/helper để serialize, nhưng không dùng chung một danh sách lựa chọn giữa customer và admin.

## Tổ chức enum đề xuất

Enum thuộc lớp domain, không đặt trong schema. Giữ enum trong `orders/enums/`, có thể tách nhóm theo file:

```text
orders/enums/
├── order_enums.py       # OrderStatus, PaymentMethod, PaymentStatus, cancellation reasons/types
└── checkout_enums.py    # CheckoutType (nếu muốn tách riêng)
```

Không bắt buộc tạo `checkout_enums.py` nếu `order_enums.py` vẫn dễ tìm. Điều bắt buộc là `CheckoutType` không còn được định nghĩa trong `checkout_schema.py`; schemas, routers và services chỉ import enum từ `orders/enums`.

## Hiện trạng cần dọn khi triển khai

- `enums/order_enums.py` đã có phần lớn enum đang dùng.
- `schemas/checkout_schema.py` còn định nghĩa `CheckoutType` tại chỗ.
- `schemas/order_schema.py` khai báo lại enum, reason text và nhiều schema tương tự các file đang dùng. Tìm kiếm trong `backend/src` và `backend/tests` hiện không thấy nơi import `schemas.order_schema`; cần xác nhận bằng tìm kiếm toàn repo trước khi xóa. Nếu thực sự dead/legacy, xóa file hoặc thay bằng compatibility re-export có chủ đích để chỉ còn một nguồn định nghĩa.
- Admin/system reason enums vẫn cần ở backend để validate luồng tương ứng; không đưa chúng vào customer catalog.

## Luồng customer cancellation

1. Frontend fetch catalog và render `label`; cache kết quả trong store/session.
2. Khi submit, gửi `reason_code` theo `value`; với `OTHER`, gửi `custom_reason` không rỗng.
3. Pydantic request model xác thực mã thuộc `CustomerCancelReason` và kiểm tra custom text cho `OTHER`.
4. Service kiểm tra user sở hữu đơn và trạng thái đơn được phép hủy; ghi lý do vào dữ liệu/log.
5. Customer catalog không dùng để biểu diễn lý do admin; admin catalog không dùng để biểu diễn customer hoặc system reason.

## Nguyên tắc khi sửa reason/enum

- Thêm/bỏ/đổi customer hoặc admin reason: cập nhật đúng enum, catalog response, request/schema/service và `CANCEL_REASON_TEXT` trong cùng thay đổi. Frontend runtime choices/labels lấy từ catalog theo đúng vai trò; có thể giữ TypeScript union compile-time hoặc sinh types từ OpenAPI.
- Không đổi mã đã lưu hoặc trả trong API nếu chưa có phương án tương thích dữ liệu cũ.
- Nhãn tiếng Việt là nội dung hiển thị; enum value là mã giao tiếp và validation.
- Frontend catalog không thay validation nghiệp vụ phía backend.
- Tạo enum mới trong `orders/enums`, không nhúng định nghĩa trong schema.

## Phạm vi triển khai tiếp theo

1. Di chuyển `CheckoutType` khỏi `checkout_schema.py` vào `orders/enums` và cập nhật import.
2. Rà soát enum/schema trùng trong `schemas/order_schema.py`; xác nhận không có import ngoài `backend/src` và `backend/tests`, rồi loại bỏ hoặc chuyển thành compatibility re-export nếu cần.
3. Tạo response schema/helper dùng chung nhưng sinh danh sách riêng từ `CustomerCancelReason` và `AdminCancelReason`, dùng nguồn nhãn tiếng Việt backend.
4. Thêm `GET /orders/cancellation-reasons` cho customer và `GET /admin/orders/cancellation-reasons` trên router admin có sẵn role guard `ADMIN`/`STAFF`.
5. Frontend mỗi luồng fetch/cache catalog tương ứng, render `label`, gửi `value`, dùng `requires_custom_reason` cho form.
6. Giữ system reasons backend-only; không đưa vào hai catalog UI.
