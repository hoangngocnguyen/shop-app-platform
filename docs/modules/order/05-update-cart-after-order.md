# Kế hoạch: Xóa sản phẩm đã checkout khỏi giỏ hàng

## 1. Mục tiêu

Khi người dùng tạo đơn từ các dòng đã chọn trong giỏ hàng, chỉ xóa đúng các dòng đó khỏi cart sau khi đơn được tạo thành công. Đơn hàng, tồn kho và cart phải được cập nhật nhất quán; nếu tạo đơn thất bại thì cart và tồn kho vẫn giữ nguyên.

Luồng `BUY_NOW` không được tác động tới cart. Luồng `CART` chỉ xóa các `cart_item_id` đã chọn, giữ nguyên những dòng không được chọn.

## 2. Nguyên nhân hiện tại

Luồng hiện tại:

1. Trang cart lưu các `cart_item_id` được chọn vào query string `cart_item_ids` khi điều hướng sang checkout.
2. Trang checkout phân tích query string thành `payload`, rồi gửi payload này tới `POST /checkout/preview`.
3. `CheckoutService.preview_checkout()` dùng các ID để tải dòng cart có kiểm tra quyền sở hữu, nhưng response hiện chỉ trả sản phẩm, số lượng và giá; ID dòng cart bị bỏ đi.
4. Khi tạo đơn, frontend dựng request mới từ `previewData.items` và chỉ gửi `product_id`, `quantity`, `price`, tổng tiền và địa chỉ. Nó không nhận được ID cart từ response preview để gửi tiếp.
5. `CreateOrderRequest` cũng không có trường nào nhận nguồn checkout hoặc ID dòng cart. Vì vậy `OrderService.create_order()` chỉ biết dữ liệu sản phẩm trong đơn và không thể xác định dòng cart cần xóa.
6. Repository hiện commit order, order details, log và thay đổi tồn kho trong `create_order()`. Nếu thêm bước xóa cart sau lời gọi này, order đã commit trước; xóa cart lỗi sẽ để lại một đơn hợp lệ nhưng cart chưa được dọn.

Điểm cần sửa là response preview của backend chưa giữ metadata cart. ID phải được backend đưa vào response để frontend chuyển nguyên dữ liệu đó sang request tạo đơn; frontend không tự suy ra hoặc tra cứu ID cart.

## 3. Hướng thiết kế đề xuất

### 3.1. Backend trả metadata cart trong response preview

Mở rộng `CheckoutPreviewResponse` với `checkout_type` và `cart_item_ids`:

- Với `CART`, trả đúng danh sách ID đã được `CheckoutService` tải và xác minh thuộc user hiện tại.
- Với `BUY_NOW` và `REORDER`, trả `cart_item_ids` rỗng.
- Giữ `cart_item_id` ở cấp metadata response thay vì gắn vào từng `CheckoutItemResponse`; nguồn checkout là thuộc tính của cả snapshot. Nếu sau này cần định danh từng dòng để hỗ trợ nhiều dòng cùng product, có thể cân nhắc trả ID theo từng item.

Frontend chỉ sử dụng metadata response này, không lấy ID từ URL để dựng payload order.

### 3.2. Giữ nguồn checkout trong request tạo đơn

Mở rộng `CreateOrderRequest` với:

- `checkout_type`, mặc định `BUY_NOW` để tương thích các client cũ.
- `cart_item_ids`, tùy chọn; bắt buộc và không rỗng nếu `checkout_type == CART`.
- Từ chối ID cart nếu nguồn là `BUY_NOW` và từ chối danh sách có ID trùng lặp.

Service vẫn phải kiểm tra lại quyền sở hữu và tính nhất quán của các ID khi tạo đơn; dữ liệu client gửi lại không được xem là đáng tin cậy chỉ vì nó đến từ preview trước đó.

### 3.3. Chuyển metadata từ response preview sang tạo đơn

Trong `frontend/src/app/checkout/page.tsx`, khi gọi `createOrder`, lấy `checkout_type` và `cart_item_ids` từ `previewData` do backend trả về. Không lấy lại từ `payload` query string và không dựng ID từ `previewData.items`.

Mở rộng `CreateOrderRequest` TypeScript tương ứng. Không gọi API xóa cart từ frontend; backend là nguồn dữ liệu chuẩn và phải thực hiện cập nhật trong transaction tạo đơn.

### 3.4. Xác thực và xóa cart ở backend

Trong `OrderService.create_order()` đối với `CART`:

1. Tải các dòng cart theo `cart_item_ids`, giới hạn theo `user_id` và khóa các dòng cần xử lý nếu phù hợp với DB.
2. Yêu cầu tất cả ID đều tồn tại và thuộc cart của user hiện tại.
3. So khớp tập sản phẩm và số lượng của các dòng cart được chọn với `request.items` (gộp theo `product_id` nếu cần). Không chỉ tin danh sách ID do client gửi, tránh xóa nhầm dòng hoặc tạo order khác với nội dung đã chọn.
4. Sau khi kiểm tra giá, tồn kho và tổng tiền thành công, xóa đúng các dòng đã chọn bằng truy vấn có điều kiện theo cart của user. Không xóa toàn bộ cart.
5. Kiểm tra số dòng bị xóa khớp số ID duy nhất yêu cầu; nếu có sai lệch thì rollback và trả lỗi phù hợp.

Thêm phương thức repository chuyên biệt cho thao tác đọc/xóa cart trong luồng order. Không gọi `CartService.delete_multiple_cart_items()` hiện tại vì hàm này tự commit transaction riêng.

### 3.5. Gom vào một transaction

Refactor `OrderRepository.create_order()` để chỉ thêm order/details/log và `flush`, không tự commit. `OrderService.create_order()` điều phối một transaction duy nhất:

1. Kiểm tra địa chỉ, nguồn checkout, cart, giá và tồn kho.
2. Trừ tồn kho.
3. Thêm order, order details và log.
4. Xóa các dòng cart đã chọn nếu nguồn là `CART`.
5. Commit một lần ở cuối; rollback toàn bộ khi bất kỳ bước nào lỗi.

Như vậy lỗi xóa cart không thể để lại order đã tạo hoặc tồn kho đã trừ mà cart còn nguyên; lỗi trước commit cũng không làm mất cart.

### 3.6. Làm mới giao diện cart

Sau thành công, frontend tiếp tục điều hướng sang trang checkout success. Không thực hiện xóa cart lặp lại bằng API từ trình duyệt. Trang cart hiện gọi `fetchCart()` khi mount; cần giữ hành vi này để lần quay lại cart đọc dữ liệu mới từ server. Nếu có nơi khác giữ cart trong Zustand qua điều hướng mà không fetch lại, bổ sung invalidate/refetch ở đúng điểm tiêu thụ store.

## 4. Phạm vi file dự kiến

- `backend/src/app/modules/orders/schemas/order_requests.py`: contract và validation cho nguồn checkout.
- `backend/src/app/modules/orders/schemas/checkout_schema.py`: response preview trả metadata `checkout_type` và `cart_item_ids`.
- `backend/src/app/modules/orders/services/checkout_service.py`: đưa ID cart đã xác thực vào response preview.
- `backend/src/app/modules/orders/services/order_service.py`: xác thực nội dung cart và điều phối transaction.
- `backend/src/app/modules/orders/repositories/repository.py`: tải/khóa/xóa dòng cart thuộc user; điều chỉnh commit của `create_order`.
- `frontend/src/features/orders/types/index.ts`: cập nhật kiểu `CreateOrderRequest`.
- `frontend/src/app/checkout/page.tsx`: gửi nguồn checkout và `cart_item_ids` khi tạo đơn.
- Tests cho service/repository/API order và luồng cart checkout.

Không cần sửa schema/database nếu vẫn giữ nguyên các bảng hiện có.

## 5. Quy tắc nghiệp vụ cần giữ

- Chỉ xóa cart sau khi tạo order thành công và commit transaction.
- Lỗi validation, đổi giá, thiếu tồn kho hoặc lỗi ghi DB: giữ nguyên cart.
- `CART`: xóa đúng các dòng được chọn; dòng chưa chọn vẫn còn.
- `BUY_NOW`: không xóa dòng cart nào, kể cả sản phẩm trùng với sản phẩm trong cart.
- Đơn có thể ở trạng thái `PENDING` sau khi tạo, ví dụ chờ thanh toán VNPAY. Kế hoạch này xóa cart tại thời điểm order được tạo thành công, không chờ thanh toán thành công. Hủy order hiện có chỉ hoàn tồn kho; không tự thêm lại sản phẩm vào cart.

## 6. Kịch bản kiểm tra khi triển khai

- Mua ngay tạo đơn thành công: cart không đổi.
- Preview checkout từ cart: backend trả về đúng `cart_item_ids` đã xác thực; frontend không lấy ID từ URL để dựng request tạo order.
- Checkout một số dòng trong cart: các dòng đã chọn bị xóa, các dòng khác còn nguyên.
- Gửi ID không thuộc user hoặc ID đã bị xóa: request thất bại, không tạo order và không trừ tồn kho.
- Nội dung ID cart không khớp sản phẩm/số lượng trong request: request thất bại, cart không đổi.
- Giá hoặc tồn kho thay đổi trước khi tạo đơn: request thất bại, cart không đổi.
- Lỗi phát sinh khi ghi/xóa cart trong transaction: order, log, tồn kho và cart cùng rollback.
- ID rỗng hoặc trùng: từ chối theo contract; không xóa vượt quá các dòng được chọn.
- Client cũ không gửi `checkout_type`: tiếp tục chạy theo mặc định `BUY_NOW`.

## 7. Trình tự triển khai

1. Bổ sung contract tạo đơn và validation theo `checkout_type`.
2. Bổ sung repository truy vấn/xóa cart có kiểm tra user và làm transaction tạo order không tự commit giữa chừng.
3. Cập nhật service để xác thực đối chiếu cart với items, rồi commit order + inventory + cart cùng nhau.
4. Cập nhật frontend để gửi metadata nguồn checkout và ID đã chọn.
5. Thêm/chạy các kiểm tra trong mục 6; kiểm tra thêm API response và cart sau khi quay lại trang giỏ hàng.

## 8. Câu hỏi nghiệp vụ ngoài phạm vi mặc định

Nếu muốn sản phẩm tự quay lại cart khi một order `PENDING` bị hủy hoặc thanh toán thất bại, cần một yêu cầu riêng. Hiện trạng không có quy tắc đó; kế hoạch mặc định không tự khôi phục cart khi hủy đơn. => Không cần, hủy là không muốn mua nữa. Để khách tự chọn lại.
