import api from "@/lib/axios/client";
import {
    AdminCancellationReasonCatalog,
    CancelOrderRequest,
    CheckoutPreviewRequest,
    CheckoutPreviewResponse,
    CreateOrderRequest,
    CustomerCancellationReasonCatalog,
    OrderActionResponse,
    OrderCreateResponse,
    OrderDetailResponse,
    OrderListParams,
    OrderListResponse,
} from "../types";

export const orderApi = {
    getCancellationReasons: async (): Promise<CustomerCancellationReasonCatalog> => {
        const response = await api.get<CustomerCancellationReasonCatalog>("/orders/cancellation-reasons");
        return response.data;
    },
    getAdminCancellationReasons: async (): Promise<AdminCancellationReasonCatalog> => {
        const response = await api.get<AdminCancellationReasonCatalog>("/admin/orders/cancellation-reasons");
        return response.data;
    },
    previewCheckout: async (payload: CheckoutPreviewRequest): Promise<CheckoutPreviewResponse> => {
        const response = await api.post<CheckoutPreviewResponse>("/checkout/preview", payload);
        return response.data;
    },
    createOrder: async (payload: CreateOrderRequest): Promise<OrderCreateResponse> => {
        const response = await api.post<OrderCreateResponse>("/orders", payload);
        return response.data;
    },
    getOrders: async (params: OrderListParams = {}): Promise<OrderListResponse> => {
        const response = await api.get<OrderListResponse>("/orders", { params });
        return response.data;
    },
    getOrderById: async (orderId: string): Promise<OrderDetailResponse> => {
        const response = await api.get<OrderDetailResponse>(`/orders/${encodeURIComponent(orderId)}`);
        return response.data;
    },
    getOrderDetail: async (orderId: string): Promise<OrderDetailResponse> => {
        return orderApi.getOrderById(orderId);
    },
    completeOrder: async (orderId: string): Promise<OrderActionResponse> => {
        const response = await api.patch<OrderActionResponse>(`/orders/${encodeURIComponent(orderId)}/complete`);
        return response.data;
    },
    cancelOrder: async (orderId: string, payload: CancelOrderRequest): Promise<OrderActionResponse> => {
        const response = await api.patch<OrderActionResponse>(`/orders/${encodeURIComponent(orderId)}/cancel`, payload);
        return response.data;
    },
    reorder: async (orderId: string): Promise<CheckoutPreviewResponse> => {
        const response = await api.post<CheckoutPreviewResponse>(`/orders/${encodeURIComponent(orderId)}/reorder`);
        return response.data;
    },
};

export type {
    AdminCancellationReasonCatalog, CancelOrderRequest, CancellationReasonCatalog,
    CheckoutPreviewRequest, CreateOrderRequest, CustomerCancellationReasonCatalog,
    OrderListParams,
} from "../types";
