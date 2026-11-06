import api from "@/lib/axios/client";
import type {
    AdminCancelOrderPayload,
    AdminOrderDetail,
    AdminOrderQueryParams,
    BulkOrderActionPayload,
    BulkOrderActionResponse,
    CancellationReasonCatalog,
    AdminCancelReason,
    OrderStatusCount,
    PaginatedAdminOrderResponse,
    SingleOrderActionResponse,
} from "../types";

/**
 * Service API tích hợp toàn bộ các endpoint quản trị đơn hàng (/api/v1/admin/orders).
 */
export const adminOrderApi = {
    /**
     * GET /admin/orders/statistics
     * Thống kê số lượng đơn theo từng trạng thái phục vụ hiển thị Badge trên các Tabs.
     */
    getStatistics: async (): Promise<OrderStatusCount[]> => {
        const response = await api.get<OrderStatusCount[]>("/admin/orders/statistics");
        return response.data;
    },

    /**
     * GET /admin/orders/cancellation-reasons
     * Lấy danh mục lý do hủy đơn hàng chuẩn dành cho Quản trị viên.
     */
    getCancellationReasons: async (): Promise<CancellationReasonCatalog<AdminCancelReason>> => {
        const response = await api.get<CancellationReasonCatalog<AdminCancelReason>>(
            "/admin/orders/cancellation-reasons"
        );
        return response.data;
    },

    /**
     * GET /admin/orders
     * Lấy danh sách đơn hàng có phân trang, tìm kiếm, lọc theo trạng thái và phương thức thanh toán.
     */
    getAdminOrders: async (
        params?: AdminOrderQueryParams
    ): Promise<PaginatedAdminOrderResponse> => {
        const response = await api.get<PaginatedAdminOrderResponse>("/admin/orders", {
            params,
        });
        return response.data;
    },

    /**
     * GET /admin/orders/{orderId}
     * Lấy toàn bộ thông tin chi tiết của 1 đơn hàng (người nhận, địa chỉ, items, timeline logs).
     */
    getAdminOrderDetail: async (orderId: string): Promise<AdminOrderDetail> => {
        const response = await api.get<AdminOrderDetail>(
            `/admin/orders/${encodeURIComponent(orderId)}`
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/confirm
     * Xác nhận xử lý đơn hàng hàng loạt (PENDING -> PROCESSING).
     * Nhận mảng order_ids (1 hoặc nhiều phần tử), tự động cập nhật QR -> PAID.
     */
    confirmOrders: async (
        payload: BulkOrderActionPayload
    ): Promise<BulkOrderActionResponse> => {
        const response = await api.patch<BulkOrderActionResponse>(
            "/admin/orders/confirm",
            payload
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/shipping
     * Chuyển đơn hàng sang trạng thái vận chuyển hàng loạt (PROCESSING -> SHIPPING).
     */
    startShippingOrders: async (
        payload: BulkOrderActionPayload
    ): Promise<BulkOrderActionResponse> => {
        const response = await api.patch<BulkOrderActionResponse>(
            "/admin/orders/shipping",
            payload
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/delivered
     * Xác nhận đơn hàng đã giao thành công hàng loạt (SHIPPING -> DELIVERED).
     * Tự động cập nhật COD -> PAID và ghi nhận thời điểm delivered_at.
     */
    completeDeliveryOrders: async (
        payload: BulkOrderActionPayload
    ): Promise<BulkOrderActionResponse> => {
        const response = await api.patch<BulkOrderActionResponse>(
            "/admin/orders/delivered",
            payload
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/{orderId}/confirm
     * Xác nhận đơn lẻ 1 đơn hàng.
     */
    confirmOrderSingle: async (orderId: string): Promise<SingleOrderActionResponse> => {
        const response = await api.patch<SingleOrderActionResponse>(
            `/admin/orders/${encodeURIComponent(orderId)}/confirm`
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/{orderId}/shipping
     * Chuyển giao hàng đơn lẻ 1 đơn hàng.
     */
    startShippingOrderSingle: async (orderId: string): Promise<SingleOrderActionResponse> => {
        const response = await api.patch<SingleOrderActionResponse>(
            `/admin/orders/${encodeURIComponent(orderId)}/shipping`
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/{orderId}/delivered
     * Xác nhận đã giao đơn lẻ 1 đơn hàng.
     */
    completeDeliveryOrderSingle: async (orderId: string): Promise<SingleOrderActionResponse> => {
        const response = await api.patch<SingleOrderActionResponse>(
            `/admin/orders/${encodeURIComponent(orderId)}/delivered`
        );
        return response.data;
    },

    /**
     * PATCH /admin/orders/{orderId}/cancel
     * Quản trị viên hủy đơn hàng với lý do chuẩn và ghi chú.
     */
    cancelOrder: async (
        orderId: string,
        payload: AdminCancelOrderPayload
    ): Promise<SingleOrderActionResponse> => {
        const response = await api.patch<SingleOrderActionResponse>(
            `/admin/orders/${encodeURIComponent(orderId)}/cancel`,
            payload
        );
        return response.data;
    },
};
