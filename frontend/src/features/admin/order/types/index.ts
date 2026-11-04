import type {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    CancelledByType,
    AdminCancelReason,
    CancellationReasonOption,
    CancellationReasonCatalog,
} from "@/features/orders/types";

// Tái xuất (re-export) các type và enums dùng chung từ @/features/orders/types
export type {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    CancelledByType,
    AdminCancelReason,
    CancellationReasonOption,
    CancellationReasonCatalog,
};

/**
 * Tóm tắt từng sản phẩm trong dòng đơn hàng (Admin view)
 */
export interface AdminOrderItemSummary {
    product_id: number;
    product_name: string;
    product_image?: string | null;
    original_price?: number | null;
    price: number;
    quantity: number;
    total_price: number;
}

/**
 * Tóm tắt đơn hàng hiển thị trên bảng quản trị (Admin table row)
 */
export interface AdminOrderSummary {
    order_id: string;
    status: OrderStatus;
    status_label_vi: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    payment_status_label_vi: string;
    total: number;
    total_items: number;
    order_date: string;
    shipping_recipient_name: string;
    shipping_phone: string;
    shipping_address_line: string;
    shipping_ward_name: string;
    shipping_province_name: string;
    customer_id: string;
    customer_name?: string | null;
    customer_email?: string | null;
    items: AdminOrderItemSummary[];
    cancel_reason?: string | null;
    cancelled_by_type?: CancelledByType | string | null;
    cancelled_at?: string | null;
}

/**
 * Chi tiết từng sản phẩm trong đơn hàng đầy đủ (Order detail view)
 */
export interface AdminOrderDetailItem {
    product_id: number;
    product_name: string;
    product_image?: string | null;
    price: number;
    quantity: number;
    total_price: number;
}

/**
 * Bản ghi nhật ký tiến trình đơn hàng (Order timeline log)
 */
export interface AdminOrderLog {
    status: OrderStatus | string;
    note?: string | null;
    timestamp: string;
}

/**
 * Toàn bộ thông tin chi tiết một đơn hàng dành cho Admin (Modal / Drawer view)
 */
export interface AdminOrderDetail {
    order_id: string;
    user_id: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    status: OrderStatus;
    address_id?: number | null;
    shipping_recipient_name: string;
    shipping_phone: string;
    shipping_province_name: string;
    shipping_ward_name: string;
    shipping_address_line: string;
    note?: string | null;
    order_details: AdminOrderDetailItem[];
    order_logs: AdminOrderLog[];
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    created_at: string;
    estimated_delivery_date?: string | null;
    delivered_at?: string | null;
    cancel_reason?: string | null;
    cancelled_by_type?: CancelledByType | string | null;
    cancelled_by_id?: string | null;
    cancelled_at?: string | null;
}

/**
 * Thống kê số lượng đơn hàng theo từng trạng thái (dùng cho badge trên các Tabs)
 */
export interface OrderStatusCount {
    status: string; // "ALL" | OrderStatus
    count: number;
    label_vi: string;
}

/**
 * Tiêu chí sắp xếp danh sách đơn hàng Admin
 */
export type AdminOrderSortBy =
    | "order_date_desc"
    | "order_date_asc"
    | "total_desc"
    | "total_asc";

/**
 * Tham số query lọc và phân trang danh sách đơn hàng Admin
 */
export interface AdminOrderQueryParams {
    page?: number;
    page_size?: number;
    order_status?: OrderStatus | null;
    payment_method?: PaymentMethod | null;
    payment_status?: PaymentStatus | null;
    search?: string | null;
    sort_by?: AdminOrderSortBy | string;
}

/**
 * Cấu trúc trả về phân trang chuẩn từ Backend
 */
export interface PaginatedAdminOrderResponse {
    items: AdminOrderSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

/**
 * Payload cho các thao tác hàng loạt (Bulk actions: Confirm, Shipping, Delivered)
 */
export interface BulkOrderActionPayload {
    order_ids: string[];
    note?: string | null;
}

/**
 * Kết quả từng đơn trong thao tác hàng loạt
 */
export interface BulkOrderActionResultItem {
    order_id: string;
    success: boolean;
    status?: string | null;
    message: string;
}

/**
 * Phản hồi tổng kết thao tác hàng loạt
 */
export interface BulkOrderActionResponse {
    total_requested: number;
    success_count: number;
    failure_count: number;
    results: BulkOrderActionResultItem[];
}

/**
 * Phản hồi khi thao tác đơn lẻ
 */
export interface SingleOrderActionResponse {
    order_id: string;
    status: OrderStatus;
    message: string;
}

/**
 * Payload cho quản trị viên hủy đơn hàng
 */
export interface AdminCancelOrderPayload {
    reason_code: AdminCancelReason | string;
    detail?: string | null;
}
