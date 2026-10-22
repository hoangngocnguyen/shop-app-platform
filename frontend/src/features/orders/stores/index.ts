import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { orderApi } from "../api";
import type {
    AdminCancellationReasonCatalog, CancelOrderRequest, CheckoutPreviewRequest, CheckoutPreviewResponse,
    CustomerCancellationReasonCatalog,
    CreateOrderRequest, OrderActionResponse, OrderCreateResponse, OrderDetailResponse,
    OrderListParams, OrderListResponse,
} from "../types";

interface OrderState {
    cancellationReasons: CustomerCancellationReasonCatalog | null;
    adminCancellationReasons: AdminCancellationReasonCatalog | null;
    checkoutPreview: CheckoutPreviewResponse | null;
    orders: OrderListResponse | null;
    selectedOrder: OrderDetailResponse | null;
    createdOrder: OrderCreateResponse | null;
    isLoading: boolean;
    error: string | null;
    setSelectedOrder: (order: OrderDetailResponse | null) => void;
    fetchCancellationReasons: () => Promise<CustomerCancellationReasonCatalog | null>;
    fetchAdminCancellationReasons: () => Promise<AdminCancellationReasonCatalog | null>;
    previewCheckout: (payload: CheckoutPreviewRequest) => Promise<CheckoutPreviewResponse | null>;
    createOrder: (payload: CreateOrderRequest) => Promise<OrderCreateResponse | null>;
    fetchOrders: (params?: OrderListParams) => Promise<OrderListResponse | null>;
    fetchOrderById: (orderId: string) => Promise<OrderDetailResponse | null>;
    completeOrder: (orderId: string) => Promise<OrderActionResponse | null>;
    cancelOrder: (orderId: string, payload: CancelOrderRequest) => Promise<OrderActionResponse | null>;
    reorder: (orderId: string) => Promise<CheckoutPreviewResponse | null>;
    reset: () => void;
}

const initialState = {
    cancellationReasons: null,
    adminCancellationReasons: null,
    checkoutPreview: null,
    orders: null,
    selectedOrder: null,
    createdOrder: null,
    isLoading: false,
    error: null,
};

export const useOrderStore = create<OrderState>((set, get) => ({
    ...initialState,
    setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
    fetchCancellationReasons: async () => {
        const cached = get().cancellationReasons;
        if (cached) return cached;
        set({ isLoading: true, error: null });
        try {
            const cancellationReasons = await orderApi.getCancellationReasons();
            set({ cancellationReasons, isLoading: false });
            return cancellationReasons;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể lấy danh sách lý do hủy đơn"), isLoading: false });
            return null;
        }
    },
    fetchAdminCancellationReasons: async () => {
        const cached = get().adminCancellationReasons;
        if (cached) return cached;
        set({ isLoading: true, error: null });
        try {
            const adminCancellationReasons = await orderApi.getAdminCancellationReasons();
            set({ adminCancellationReasons, isLoading: false });
            return adminCancellationReasons;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể lấy danh sách lý do hủy đơn quản trị"), isLoading: false });
            return null;
        }
    },
    previewCheckout: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const checkoutPreview = await orderApi.previewCheckout(payload);
            set({ checkoutPreview, isLoading: false });
            return checkoutPreview;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể xem trước thanh toán"), isLoading: false });
            return null;
        }
    },
    createOrder: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const createdOrder = await orderApi.createOrder(payload);
            set({ createdOrder, isLoading: false });
            return createdOrder;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể tạo đơn hàng"), isLoading: false });
            return null;
        }
    },
    fetchOrders: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const orders = await orderApi.getOrders(params);
            set({ orders, isLoading: false });
            return orders;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể lấy danh sách đơn hàng"), isLoading: false });
            return null;
        }
    },
    fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const selectedOrder = await orderApi.getOrderById(orderId);
            set({ selectedOrder, isLoading: false });
            return selectedOrder;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể lấy chi tiết đơn hàng"), isLoading: false });
            return null;
        }
    },
    completeOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const result = await orderApi.completeOrder(orderId);
            set((state) => ({
                selectedOrder: state.selectedOrder?.order_id === orderId
                    ? { ...state.selectedOrder, status: result.status }
                    : state.selectedOrder,
                isLoading: false,
            }));
            return result;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể xác nhận đã nhận hàng"), isLoading: false });
            return null;
        }
    },
    cancelOrder: async (orderId, payload) => {
        set({ isLoading: true, error: null });
        try {
            const result = await orderApi.cancelOrder(orderId, payload);
            set((state) => ({
                selectedOrder: state.selectedOrder?.order_id === orderId
                    ? { ...state.selectedOrder, status: result.status, cancel_reason: result.cancel_reason,
                        cancelled_by_type: result.cancelled_by_type, cancelled_at: result.cancelled_at }
                    : state.selectedOrder,
                isLoading: false,
            }));
            return result;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể hủy đơn hàng"), isLoading: false });
            return null;
        }
    },
    reorder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const checkoutPreview = await orderApi.reorder(orderId);
            set({ checkoutPreview, isLoading: false });
            return checkoutPreview;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể mua lại đơn hàng"), isLoading: false });
            return null;
        }
    },
    reset: () => set(initialState),
}));
