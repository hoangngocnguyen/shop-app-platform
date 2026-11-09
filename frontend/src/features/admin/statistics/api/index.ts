import api from "@/lib/axios/client";
import type {
    AdminOverviewResponse,
    CustomerStatisticsResponse,
    OrderStatisticsResponse,
    ProductStatisticsResponse,
    RevenueStatisticsQuery,
    RevenueStatisticsResponse,
} from "../types";

export const adminStatisticsApi = {
    /**
     * GET /admin/statistics
     * Thống kê tổng quan dashboard: doanh thu, đơn hàng, thanh toán và tồn kho thấp.
     */
    getOverview: async (): Promise<AdminOverviewResponse> => {
        const response =
            await api.get<AdminOverviewResponse>("/admin/statistics");
        return response.data;
    },

    /**
     * GET /admin/statistics/revenue
     * Nhận khoảng ngày và đơn vị nhóm để tạo chuỗi doanh thu tùy chỉnh.
     */
    getRevenueStatistics: async (
        params?: RevenueStatisticsQuery
    ): Promise<RevenueStatisticsResponse> => {
        const response = await api.get<RevenueStatisticsResponse>(
            "/admin/statistics/revenue",
            { params }
        );
        return response.data;
    },

    /**
     * GET /admin/statistics/orders
     * Phân loại số lượng đơn hàng theo trạng thái và phương thức thanh toán.
     */
    getOrderStatistics: async (): Promise<OrderStatisticsResponse> => {
        const response =
            await api.get<OrderStatisticsResponse>("/admin/statistics/orders");
        return response.data;
    },

    /**
     * GET /admin/statistics/products
     * Top sản phẩm bán chạy trong tháng và cảnh báo sản phẩm tồn kho thấp.
     */
    getProductStatistics: async (): Promise<ProductStatisticsResponse> => {
        const response =
            await api.get<ProductStatisticsResponse>("/admin/statistics/products");
        return response.data;
    },

    /**
     * GET /admin/statistics/customers
     * Danh sách khách hàng chi tiêu nhiều nhất trong tháng hiện tại.
     */
    getCustomerStatistics: async (): Promise<CustomerStatisticsResponse> => {
        const response =
            await api.get<CustomerStatisticsResponse>(
                "/admin/statistics/customers"
            );
        return response.data;
    },
};