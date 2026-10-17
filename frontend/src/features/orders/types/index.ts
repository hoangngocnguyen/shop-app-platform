export type CheckoutType = "BUY_NOW" | "CART";

export type OrderStatus =
    | "PENDING"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURNED";

export const PAYMENT_METHOD = {
    BANK_TRANSFER: "BANK_TRANSFER",
    VNPAY: "VNPAY",
    COD: "COD",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type CancelledByType = "CUSTOMER" | "SHOP_OWNER" | "SYSTEM" | "ADMIN";

export type CustomerCancelReason =
    | "CHANGE_OF_MIND"
    | "CHANGE_SHIPPING_ADDRESS"
    | "FOUND_BETTER_PRICE"
    | "CHANGE_PAYMENT_METHOD"
    | "OTHER";

export type AdminCancelReason =
    | "OUT_OF_STOCK"
    | "WRONG_PRICE_OR_INFO"
    | "CUSTOMER_REQUESTED"
    | "SUSPICIOUS_ORDER"
    | "OTHER";

export type SystemCancelReason = "PAYMENT_TIMEOUT" | "CONFIRMATION_TIMEOUT";
export type Money = number | string;

export interface CancellationReasonOption<TValue extends string = string> {
    value: TValue;
    label: string;
    requires_custom_reason: boolean;
}
export interface CancellationReasonCatalog<TValue extends string = string> {
    items: CancellationReasonOption<TValue>[];
}
export type CustomerCancellationReasonCatalog = CancellationReasonCatalog<CustomerCancelReason>;
export type AdminCancellationReasonCatalog = CancellationReasonCatalog<AdminCancelReason>;

export interface BuyNowItem { product_id: number; quantity: number }
export interface CheckoutPreviewRequest {
    checkout_type: CheckoutType;
    buy_now_item?: BuyNowItem | null;
    cart_item_ids?: number[] | null;
}
export interface CheckoutItemResponse {
    product_id: number;
    product_name: string;
    product_image: string | null;
    price: Money;
    quantity: number;
    total_price: Money;
}
export interface CheckoutPreviewResponse { items: CheckoutItemResponse[]; subtotal: Money }

export interface OrderItemPreviewRequest { product_id: number; quantity: number; price: Money }
export interface CreateOrderRequest {
    items: OrderItemPreviewRequest[];
    expected_subtotal: Money;
    address_id: number;
    payment_method: PaymentMethod;
    note?: string | null;
}
export interface CancelOrderRequest { reason_code: CustomerCancelReason; custom_reason?: string | null }
export interface AdminCancelOrderRequest { reason_code: AdminCancelReason; custom_reason?: string | null }
export interface SystemCancelOrderRequest { reason_code: SystemCancelReason; note?: string | null }

export interface OrderCreateResponse {
    order_id: string;
    payment_method: PaymentMethod;
    total: Money;
    status: OrderStatus;
}
export interface OrderItemSummaryResponse {
    product_id: number;
    product_name: string;
    product_image: string | null;
    original_price: Money | null;
    price: Money;
    quantity: number;
    total_price: Money;
}
export interface OrderSummaryResponse {
    order_id: string;
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    total_amount: Money;
    total_items: number;
    created_at: string;
    cancel_reason: string | null;
    cancelled_by_type: CancelledByType | null;
    cancelled_at: string | null;
    items: OrderItemSummaryResponse[];
}
export interface OrderListResponse {
    items: OrderSummaryResponse[];
    total_items: number;
    total_pages: number;
    current_page: number;
    limit: number;
}
export interface OrderLogResponse { status: OrderStatus | string; note: string | null; timestamp: string }
export interface OrderDetailResponse {
    order_id: string;
    user_id: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    status: OrderStatus;
    address_id: number | null;
    shipping_recipient_name: string;
    shipping_phone: string;
    shipping_province_name: string;
    shipping_ward_name: string;
    shipping_address_line: string;
    note: string | null;
    order_details: CheckoutItemResponse[];
    order_logs: OrderLogResponse[];
    subtotal: Money;
    shipping_fee: Money;
    total_amount: Money;
    created_at: string;
    estimated_delivery_date: string | null;
    delivered_at: string | null;
    cancel_reason: string | null;
    cancelled_by_type: CancelledByType | null;
    cancelled_by_id: string | null;
    cancelled_at: string | null;
}
export interface OrderActionResponse {
    order_id: string;
    status: OrderStatus;
    message: string;
    cancel_reason: string | null;
    cancelled_by_type: CancelledByType | null;
    cancelled_at: string | null;
}
export interface OrderListParams {
    orderStatus?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
}
