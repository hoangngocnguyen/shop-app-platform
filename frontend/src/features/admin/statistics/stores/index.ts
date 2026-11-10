import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { adminStatisticsApi } from "../api";
import type {
    AdminOverviewQuery,
    AdminOverviewResponse,
    CustomerStatisticsQuery,
    CustomerStatisticsResponse,
    OrderStatisticsResponse,
    ProductStatisticsQuery,
    ProductStatisticsResponse,
    RevenueStatisticsQuery,
    RevenueStatisticsResponse,
} from "../types";

interface AdminStatisticsState {
    overview: AdminOverviewResponse | null;
    revenueStatistics: RevenueStatisticsResponse | null;
    orderStatistics: OrderStatisticsResponse | null;
    productStatistics: ProductStatisticsResponse | null;
    customerStatistics: CustomerStatisticsResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchOverview: (
        query?: AdminOverviewQuery
    ) => Promise<AdminOverviewResponse | null>;
    fetchRevenueStatistics: (
        query?: RevenueStatisticsQuery
    ) => Promise<RevenueStatisticsResponse | null>;
    fetchOrderStatistics: () => Promise<OrderStatisticsResponse | null>;
    fetchProductStatistics: (
        query?: ProductStatisticsQuery
    ) => Promise<ProductStatisticsResponse | null>;
    fetchCustomerStatistics: (
        query?: CustomerStatisticsQuery
    ) => Promise<CustomerStatisticsResponse | null>;
    fetchAll: (revenueQuery?: RevenueStatisticsQuery) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    overview: null,
    revenueStatistics: null,
    orderStatistics: null,
    productStatistics: null,
    customerStatistics: null,
    isLoading: false,
    error: null,
};

export const useAdminStatisticsStore = create<AdminStatisticsState>((set) => ({
    ...initialState,

    fetchOverview: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const overview = await adminStatisticsApi.getOverview(query);
            set({ overview, isLoading: false });
            return overview;
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(err, "Không thể lấy thống kê tổng quan"),
                isLoading: false,
            });
            return null;
        }
    },

    fetchRevenueStatistics: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const revenueStatistics =
                await adminStatisticsApi.getRevenueStatistics(query);
            set({ revenueStatistics, isLoading: false });
            return revenueStatistics;
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(err, "Không thể lấy thống kê doanh thu"),
                isLoading: false,
            });
            return null;
        }
    },

    fetchOrderStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
            const orderStatistics =
                await adminStatisticsApi.getOrderStatistics();
            set({ orderStatistics, isLoading: false });
            return orderStatistics;
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(err, "Không thể lấy thống kê đơn hàng"),
                isLoading: false,
            });
            return null;
        }
    },

    fetchProductStatistics: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const productStatistics =
                await adminStatisticsApi.getProductStatistics(query);
            set({ productStatistics, isLoading: false });
            return productStatistics;
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(err, "Không thể lấy thống kê sản phẩm"),
                isLoading: false,
            });
            return null;
        }
    },

    fetchCustomerStatistics: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const customerStatistics =
                await adminStatisticsApi.getCustomerStatistics(query);
            set({ customerStatistics, isLoading: false });
            return customerStatistics;
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(err, "Không thể lấy thống kê khách hàng"),
                isLoading: false,
            });
            return null;
        }
    },

    fetchAll: async (revenueQuery) => {
        set({ isLoading: true, error: null });
        try {
            const results = await Promise.allSettled([
                adminStatisticsApi.getOverview(),
                adminStatisticsApi.getRevenueStatistics(revenueQuery),
                adminStatisticsApi.getOrderStatistics(),
                adminStatisticsApi.getProductStatistics(),
                adminStatisticsApi.getCustomerStatistics(),
            ]);

            const [
                overview,
                revenueStatistics,
                orderStatistics,
                productStatistics,
                customerStatistics,
            ] = results.map((result) =>
                result.status === "fulfilled" ? result.value : null
            );

            const rejected = results.filter(
                (result): result is PromiseRejectedResult =>
                    result.status === "rejected"
            );

            set({
                overview: overview as AdminOverviewResponse | null,
                revenueStatistics: revenueStatistics as RevenueStatisticsResponse | null,
                orderStatistics: orderStatistics as OrderStatisticsResponse | null,
                productStatistics: productStatistics as ProductStatisticsResponse | null,
                customerStatistics: customerStatistics as CustomerStatisticsResponse | null,
                isLoading: false,
                error: rejected.length > 0
                    ? parseErrorMessage(
                        rejected[0].reason,
                        "Một phần dữ liệu thống kê không thể tải"
                    )
                    : null,
            });
        } catch (err: unknown) {
            set({
                error: parseErrorMessage(
                    err,
                    "Không thể tải dữ liệu thống kê quản trị"
                ),
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
    reset: () => set(initialState),
}));