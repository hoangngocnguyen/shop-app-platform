import { create } from "zustand";
import { adminOrderApi } from "../api";
import type {
    AdminCancelOrderPayload,
    AdminCancelReason,
    AdminOrderDetail,
    AdminOrderQueryParams,
    AdminOrderSortBy,
    AdminOrderSummary,
    BulkOrderActionResponse,
    CancellationReasonOption,
    OrderStatus,
    OrderStatusCount,
    PaymentMethod,
    PaymentStatus,
} from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { toast } from "@/common/stores/useToastStore";

interface AdminOrderState {
    // ---------- Dữ liệu danh sách ----------
    orders: AdminOrderSummary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;

    // ---------- Thống kê Tabs & Danh mục lý do ----------
    statistics: OrderStatusCount[];
    cancellationReasons: CancellationReasonOption<AdminCancelReason>[];

    // ---------- Xem chi tiết đơn hàng ----------
    selectedOrder: AdminOrderDetail | null;

    // ---------- Quản lý chọn hàng loạt ----------
    selectedOrderIds: string[];

    // ---------- Bộ lọc & Tìm kiếm ----------
    selectedStatus: OrderStatus | "ALL";
    selectedPaymentMethod: PaymentMethod | "ALL";
    selectedPaymentStatus: PaymentStatus | "ALL";
    searchQuery: string;
    sortBy: AdminOrderSortBy;

    // ---------- Trạng thái xử lý ----------
    isLoading: boolean;
    isActionLoading: boolean;
    isDetailLoading: boolean;
    error: string | null;

    // ---------- Setters bộ lọc ----------
    setSelectedStatus: (status: OrderStatus | "ALL") => void;
    setSelectedPaymentMethod: (method: PaymentMethod | "ALL") => void;
    setSelectedPaymentStatus: (status: PaymentStatus | "ALL") => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: AdminOrderSortBy) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    resetFilters: () => void;

    // ---------- Thao tác Checkbox ----------
    toggleSelectOrder: (orderId: string) => void;
    selectAllCurrentPage: () => void;
    clearSelection: () => void;

    // ---------- Async Actions ----------
    fetchOrders: () => Promise<void>;
    fetchStatistics: () => Promise<void>;
    fetchCancellationReasons: () => Promise<void>;
    fetchOrderDetail: (orderId: string) => Promise<void>;
    clearSelectedOrder: () => void;

    confirmOrders: (
        orderIds: string[],
        note?: string
    ) => Promise<BulkOrderActionResponse | null>;
    startShippingOrders: (
        orderIds: string[],
        note?: string
    ) => Promise<BulkOrderActionResponse | null>;
    completeDeliveryOrders: (
        orderIds: string[],
        note?: string
    ) => Promise<BulkOrderActionResponse | null>;
    cancelOrder: (
        orderId: string,
        payload: AdminCancelOrderPayload
    ) => Promise<boolean>;

    clearError: () => void;
}

export const useAdminOrderStore = create<AdminOrderState>((set, get) => ({
    // Giá trị khởi tạo
    orders: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    statistics: [],
    cancellationReasons: [],
    selectedOrder: null,
    selectedOrderIds: [],
    selectedStatus: "ALL",
    selectedPaymentMethod: "ALL",
    selectedPaymentStatus: "ALL",
    searchQuery: "",
    sortBy: "order_date_desc",
    isLoading: false,
    isActionLoading: false,
    isDetailLoading: false,
    error: null,

    // =========================================================================
    // SETTERS BỘ LỌC & PHÂN TRANG
    // =========================================================================

    setSelectedStatus: (status) => {
        set({ selectedStatus: status, page: 1, selectedOrderIds: [] });
        get().fetchOrders();
    },

    setSelectedPaymentMethod: (method) => {
        set({ selectedPaymentMethod: method, page: 1, selectedOrderIds: [] });
        get().fetchOrders();
    },

    setSelectedPaymentStatus: (status) => {
        set({ selectedPaymentStatus: status, page: 1, selectedOrderIds: [] });
        get().fetchOrders();
    },

    setSearchQuery: (query) => {
        set({ searchQuery: query, page: 1, selectedOrderIds: [] });
        get().fetchOrders();
    },

    setSortBy: (sortBy) => {
        set({ sortBy });
        get().fetchOrders();
    },

    setPage: (page) => {
        set({ page, selectedOrderIds: [] });
        get().fetchOrders();
    },

    setPageSize: (pageSize) => {
        set({ pageSize, page: 1, selectedOrderIds: [] });
        get().fetchOrders();
    },

    resetFilters: () => {
        set({
            selectedStatus: "ALL",
            selectedPaymentMethod: "ALL",
            selectedPaymentStatus: "ALL",
            searchQuery: "",
            sortBy: "order_date_desc",
            page: 1,
            selectedOrderIds: [],
        });
        get().fetchOrders();
        get().fetchStatistics();
    },

    // =========================================================================
    // THAO TÁC CHECKBOX CHỌN NHIỀU ĐƠN HÀNG
    // =========================================================================

    toggleSelectOrder: (orderId) => {
        const { selectedOrderIds } = get();
        if (selectedOrderIds.includes(orderId)) {
            set({ selectedOrderIds: selectedOrderIds.filter((id) => id !== orderId) });
        } else {
            set({ selectedOrderIds: [...selectedOrderIds, orderId] });
        }
    },

    selectAllCurrentPage: () => {
        const { orders, selectedOrderIds } = get();
        const currentPageIds = orders.map((o) => o.order_id);
        const isAllSelected =
            currentPageIds.length > 0 &&
            currentPageIds.every((id) => selectedOrderIds.includes(id));

        if (isAllSelected) {
            // Bỏ chọn toàn bộ trang này
            set({
                selectedOrderIds: selectedOrderIds.filter(
                    (id) => !currentPageIds.includes(id)
                ),
            });
        } else {
            // Chọn toàn bộ trang này (merge set)
            const newSelection = Array.from(
                new Set([...selectedOrderIds, ...currentPageIds])
            );
            set({ selectedOrderIds: newSelection });
        }
    },

    clearSelection: () => {
        set({ selectedOrderIds: [] });
    },

    clearSelectedOrder: () => {
        set({ selectedOrder: null });
    },

    clearError: () => {
        set({ error: null });
    },

    // =========================================================================
    // ASYNC ACTIONS
    // =========================================================================

    fetchOrders: async () => {
        const {
            page,
            pageSize,
            selectedStatus,
            selectedPaymentMethod,
            selectedPaymentStatus,
            searchQuery,
            sortBy,
        } = get();

        set({ isLoading: true, error: null });

        try {
            const params: AdminOrderQueryParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
            };

            if (selectedStatus !== "ALL") {
                params.order_status = selectedStatus;
            }
            if (selectedPaymentMethod !== "ALL") {
                params.payment_method = selectedPaymentMethod;
            }
            if (selectedPaymentStatus !== "ALL") {
                params.payment_status = selectedPaymentStatus;
            }
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const data = await adminOrderApi.getAdminOrders(params);

            set({
                orders: data.items,
                total: data.total,
                totalPages: data.total_pages,
                isLoading: false,
            });
        } catch (error: unknown) {
            const message = parseErrorMessage(error, "Không thể tải danh sách đơn hàng");
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    fetchStatistics: async () => {
        try {
            const stats = await adminOrderApi.getStatistics();
            set({ statistics: stats });
        } catch (error: unknown) {
            console.error("Lỗi khi tải thống kê đơn hàng:", error);
        }
    },

    fetchCancellationReasons: async () => {
        try {
            const catalog = await adminOrderApi.getCancellationReasons();
            set({ cancellationReasons: catalog.items });
        } catch (error: unknown) {
            console.error("Lỗi khi tải danh mục lý do hủy:", error);
        }
    },

    fetchOrderDetail: async (orderId: string) => {
        set({ isDetailLoading: true, error: null });
        try {
            const detail = await adminOrderApi.getAdminOrderDetail(orderId);
            set({ selectedOrder: detail, isDetailLoading: false });
        } catch (error: unknown) {
            const message = parseErrorMessage(
                error,
                `Không thể tải chi tiết đơn hàng #${orderId}`
            );
            set({ error: message, isDetailLoading: false });
            toast.error(message);
        }
    },

    confirmOrders: async (orderIds: string[], note?: string) => {
        if (!orderIds.length) return null;
        set({ isActionLoading: true });

        try {
            const res = await adminOrderApi.confirmOrders({
                order_ids: orderIds,
                note,
            });

            if (res.failure_count === 0) {
                toast.success(
                    `Đã xác nhận thành công ${res.success_count} đơn hàng`
                );
            } else if (res.success_count > 0) {
                toast.warning(
                    `Xác nhận ${res.success_count} thành công, ${res.failure_count} thất bại`
                );
            } else {
                toast.error(
                    `Xác nhận thất bại: ${res.results[0]?.message || "Lỗi không xác định"}`
                );
            }

            // Làm mới dữ liệu và xóa chọn
            set({ isActionLoading: false, selectedOrderIds: [] });
            get().fetchOrders();
            get().fetchStatistics();
            return res;
        } catch (error: unknown) {
            const message = parseErrorMessage(
                error,
                "Không thể thực hiện xác nhận đơn hàng"
            );
            set({ isActionLoading: false });
            toast.error(message);
            return null;
        }
    },

    startShippingOrders: async (orderIds: string[], note?: string) => {
        if (!orderIds.length) return null;
        set({ isActionLoading: true });

        try {
            const res = await adminOrderApi.startShippingOrders({
                order_ids: orderIds,
                note,
            });

            if (res.failure_count === 0) {
                toast.success(
                    `Đã chuyển vận chuyển ${res.success_count} đơn hàng`
                );
            } else if (res.success_count > 0) {
                toast.warning(
                    `Chuyển vận chuyển ${res.success_count} thành công, ${res.failure_count} thất bại`
                );
            } else {
                toast.error(
                    `Chuyển vận chuyển thất bại: ${res.results[0]?.message || "Lỗi không xác định"}`
                );
            }

            set({ isActionLoading: false, selectedOrderIds: [] });
            get().fetchOrders();
            get().fetchStatistics();
            return res;
        } catch (error: unknown) {
            const message = parseErrorMessage(
                error,
                "Không thể chuyển đơn hàng sang vận chuyển"
            );
            set({ isActionLoading: false });
            toast.error(message);
            return null;
        }
    },

    completeDeliveryOrders: async (orderIds: string[], note?: string) => {
        if (!orderIds.length) return null;
        set({ isActionLoading: true });

        try {
            const res = await adminOrderApi.completeDeliveryOrders({
                order_ids: orderIds,
                note,
            });

            if (res.failure_count === 0) {
                toast.success(
                    `Đã xác nhận giao thành công ${res.success_count} đơn hàng`
                );
            } else if (res.success_count > 0) {
                toast.warning(
                    `Giao thành công ${res.success_count}, thất bại ${res.failure_count}`
                );
            } else {
                toast.error(
                    `Xác nhận giao hàng thất bại: ${res.results[0]?.message || "Lỗi không xác định"}`
                );
            }

            set({ isActionLoading: false, selectedOrderIds: [] });
            get().fetchOrders();
            get().fetchStatistics();
            return res;
        } catch (error: unknown) {
            const message = parseErrorMessage(
                error,
                "Không thể xác nhận giao hàng"
            );
            set({ isActionLoading: false });
            toast.error(message);
            return null;
        }
    },

    cancelOrder: async (orderId: string, payload: AdminCancelOrderPayload) => {
        set({ isActionLoading: true });

        try {
            await adminOrderApi.cancelOrder(orderId, payload);
            toast.success(`Đã hủy đơn hàng #${orderId} thành công`);

            set({ isActionLoading: false });
            get().fetchOrders();
            get().fetchStatistics();

            // Nếu đang mở drawer chi tiết của đơn này, cập nhật lại chi tiết
            if (get().selectedOrder?.order_id === orderId) {
                get().fetchOrderDetail(orderId);
            }
            return true;
        } catch (error: unknown) {
            const message = parseErrorMessage(
                error,
                `Không thể hủy đơn hàng #${orderId}`
            );
            set({ isActionLoading: false });
            toast.error(message);
            return false;
        }
    },
}));
