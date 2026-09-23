# Quy Chuẩn & Nguyên Tắc Thiết Kế Cơ Sở Dữ Liệu (Database Rules)

Tài liệu này quy định các tiêu chuẩn đặt tên, chuẩn hóa kiểu dữ liệu, thiết kế quan hệ, đánh chỉ mục và quy tắc triển khai SQLAlchemy 2.0 / PostgreSQL cho dự án **Shop App Platform**.

---

## 1. Quy chuẩn đặt tên (Naming Conventions)

Toàn bộ cơ sở dữ liệu trên **PostgreSQL** phải tuân thủ chuẩn **`snake_case`** (chữ thường, phân cách bởi dấu gạch dưới). Tuyệt đối không dùng `camelCase` hoặc `PascalCase` trong Database để tránh xung đột trích dẫn (`"`) trong PostgreSQL.

### 1.1. Tên bảng (Table Names)
- Sử dụng danh từ số nhiều (Plural), chữ thường, phân cách bằng dấu gạch dưới `_`.
- Ví dụ: `users`, `products`, `categories`, `orders`, `order_details`, `shipping_addresses`, `cart_items`.
- *Lưu ý*: Đối với các bảng nối hoặc quan hệ 1-N chi tiết, đặt tên theo dạng `<bảng_chính>_<chi_tiết>` (ví dụ: `order_details`, `cart_items`).

### 1.2. Tên cột (Column Names)
- Sử dụng danh từ hoặc tính từ, chữ thường, `snake_case`.
- **Khóa chính (Primary Key)**:
  - Bảng nghiệp vụ cốt lõi: Sử dụng `<tên_bảng_số_ít>_id` (ví dụ: `user_id`, `product_id`, `category_id`, `order_id`, `cart_id`).
  - Bảng phụ/bảng nhật ký (Log, Token): Có thể dùng `id` (ví dụ: `id` trong `order_log`, `roles`, `shipping_addresses`).
- **Khóa ngoại (Foreign Key)**:
  - Bắt buộc đặt tên theo khóa chính của bảng được tham chiếu: `<tên_bảng_được_tham_chiếu_số_ít>_id`.
  - Ví dụ: `user_id`, `category_id`, `order_id`, `product_id`, `role_id`.
- **Cột cờ trạng thái (Boolean/Flag)**:
  - Sử dụng tiền tố `is_`, `has_`, `can_`.
  - Ví dụ: `is_active`, `is_blocked`, `is_default`.
- **Cột ngày giờ (Timestamp / Date)**:
  - Sử dụng hậu tố `_at` cho thời điểm đầy đủ (Datetime/Timestamp): `created_at`, `updated_at`, `payment_at`, `deleted_at`, `last_login_at`.
  - Sử dụng hậu tố `_date` cho ngày (Date only): `order_date`, `delivery_date`, `date_of_birth`.

### 1.3. Quy chuẩn đặt tên Ràng buộc & Chỉ mục (Constraints & Indexes)
Để Alembic sinh migration chuẩn xác và dễ quản lý, đặt tên theo quy tắc sau:
- **Chỉ mục thường (Index)**: `ix_<tên_bảng>_<tên_cột>` (ví dụ: `ix_categories_slug`, `ix_users_email`).
- **Chỉ mục duy nhất (Unique Constraint)**: `uq_<tên_bảng>_<tên_cột>` (ví dụ: `uq_users_username`).
- **Khóa ngoại (Foreign Key Constraint)**: `fk_<tên_bảng_nguồn>_<tên_bảng_đích>_<tên_cột>` (ví dụ: `fk_products_categories_category_id`).
- **Khóa chính (Primary Key Constraint)**: `pk_<tên_bảng>` (ví dụ: `pk_users`).

---

## 2. Chuẩn hóa kiểu dữ liệu (Data Types Standard)

Khi chuyển từ mô hình MySQL/Java sang **PostgreSQL 18** và **SQLAlchemy 2.0**, bắt buộc tuân theo các ánh xạ kiểu dữ liệu sau:

| Loại dữ liệu | MySQL / Java Type | PostgreSQL Native Type | SQLAlchemy 2.0 Mapping Type | Ghi chú quy chuẩn |
| :--- | :--- | :--- | :--- | :--- |
| **Định danh UUID** | `binary(16)` / `UUID` | `UUID` | `Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)` | Dùng UUID native của PostgreSQL |
| **Khóa chính tự tăng**| `int AUTO_INCREMENT` | `SERIAL` / `INTEGER` | `Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)` | Dành cho các bảng dùng integer PK |
| **Khóa chính BigInt** | `bigint AUTO_INCREMENT`| `BIGSERIAL` / `BIGINT` | `Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)` | Dành cho bảng dữ liệu lớn (Token, Log) |
| **Tiền tệ / Giá bán** | `decimal(38,2)` | `NUMERIC(38, 2)` | `Mapped[Decimal] = mapped_column(Numeric(38, 2))` | **Tuyệt đối không dùng Float/Double** tránh sai số tài chính |
| **Số lượng / Điểm** | `int` / `tinyint` | `INTEGER` / `SMALLINT`| `Mapped[int] = mapped_column(Integer)` | Lưu số lượng kho, đã bán, % giảm giá |
| **Chuỗi ngắn** | `varchar(255)` | `VARCHAR(255)` | `Mapped[str] = mapped_column(String(255))` | Tên, email, slug, số điện thoại, tiêu đề |
| **Chuỗi dài / Mô tả**| `text` | `TEXT` | `Mapped[str \| None] = mapped_column(Text, nullable=True)` | Bài viết, mô tả chi tiết sản phẩm |
| **Đúng / Sai (Boolean)**| `tinyint(1)` / `boolean`| `BOOLEAN` | `Mapped[bool] = mapped_column(Boolean, default=True)` | `True` / `False` rõ ràng |
| **Ngày giờ (Timestamp)**| `datetime(6)` | `TIMESTAMP` / `TIMESTAMPTZ` | `Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)` | Thời điểm tạo, cập nhật, đặt hàng |
| **Ngày sinh / Ngày** | `date` | `DATE` | `Mapped[date \| None] = mapped_column(Date, nullable=True)` | Ngày sinh nhật |

---

## 3. Quy chuẩn Audit Fields (Quản lý vết thời gian)

Hầu hết các bảng dữ liệu nghiệp vụ quan trọng (`users`, `products`, `orders`, `order_log`, `categories`) **phải có 2 trường Audit**:
- `created_at`: Thời điểm tạo bản ghi. Khai báo `default=datetime.utcnow`, không cho phép sửa đổi sau khi tạo.
- `updated_at`: Thời điểm cập nhật cuối cùng. Khai báo `default=datetime.utcnow, onupdate=datetime.utcnow`.

---

## 4. Chiến lược Đánh chỉ mục (Indexing Strategy)

Để tối ưu hóa hiệu năng truy vấn và tránh tình trạng Full Table Scan:

1. **Bắt buộc đánh Unique Index**:
   - Mọi cột dùng để định danh hoặc đăng nhập: `users.username`, `users.email`, `users.phone`, `categories.slug`, `refresh_token.token`, `roles.name`.
2. **Đánh Index trên tất cả các Khóa ngoại (Foreign Keys)**:
   - Các cột tham chiếu `user_id`, `category_id`, `order_id`, `product_id`, `cart_id` phải luôn có `index=True` để tăng tốc phép `JOIN`.
3. **Đánh Index cho các cột thường xuyên lọc / tìm kiếm**:
   - `orders.status`, `orders.order_date`, `products.brand`, `products.rating`.

---

## 5. Ràng buộc toàn vẹn & Hành vi Khóa ngoại (Referential Integrity)

- **`ondelete="CASCADE"`**: Sử dụng khi thực thể phụ thuộc hoàn toàn vào thực thể cha.
  - Ví dụ: Xóa `Cart` $\rightarrow$ Tự động xóa `CartItem`.
  - Xóa `Order` $\rightarrow$ Tự động xóa `OrderDetail`.
  - Xóa `User` $\rightarrow$ Tự động xóa `RefreshToken`, `PasswordResetToken`, `ShippingAddress`.
- **`ondelete="SET NULL"`**: Sử dụng khi bản ghi cha bị xóa nhưng bản ghi con vẫn cần giữ lại hoặc danh mục phân cấp.
  - Ví dụ: `categories.parent_id` tham chiếu `categories.category_id` (`ondelete="SET NULL"`).
  - `products.category_id` (`ondelete="SET NULL"` khi xóa category).
- **`ondelete="RESTRICT"` / `"NO ACTION"`**: Mặc định ngăn chặn việc xóa nếu đang có dữ liệu nghiệp vụ quan trọng ràng buộc (ví dụ: Không cho xóa `User` nếu đã phát sinh `orders`).

---

## 6. Quy tắc Migration với Alembic

1. **Không sửa trực tiếp trên Database**: Mọi thay đổi về cấu trúc bảng (thêm/sửa/xóa cột, đổi kiểu dữ liệu, thêm index) đều phải thông qua Alembic migration script.
2. **Tính độc lập & Khả năng Rollback**: Mọi file migration phải có đầy đủ cả hàm `upgrade()` và `downgrade()` tương ứng.
3. **Commit kèm Code**: File migration trong `backend/alembic/versions/` phải được commit chung với pull request chứa Model thay đổi.
