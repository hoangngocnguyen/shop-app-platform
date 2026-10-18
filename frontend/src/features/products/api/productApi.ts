import api from "@/lib/axios/client";
import {
    ProductResponse,
    ProductDetailResponse,
    PriceOptionDTO,
    ProductFilterParams,
    PaginatedProducts,
} from "../types";

export const productApi = {
    /**
     * Lọc và tìm kiếm danh sách sản phẩm (Client)
     * GET /products
     */
    getProducts: async (params?: ProductFilterParams): Promise<PaginatedProducts> => {
        const response = await api.get<PaginatedProducts>("/products", {
            params,
        });
        const result = (response as unknown as { data: PaginatedProducts })?.data ?? response;
        return result as PaginatedProducts;
    },

    /**
     * Lấy danh sách dải giá cố định để render bộ lọc nhanh
     * GET /products/price-options
     */
    getPriceOptions: async (): Promise<PriceOptionDTO[]> => {
        const response = await api.get<PriceOptionDTO[]>("/products/price-options");
        const result = (response as unknown as { data: PriceOptionDTO[] })?.data ?? response;
        return result as PriceOptionDTO[];
    },

    /**
     * Lấy chi tiết một sản phẩm theo ID
     * GET /products/{id}
     */
    getProductDetail: async (id: number | string): Promise<ProductDetailResponse> => {
        const response = await api.get<ProductDetailResponse>(`/products/${id}`);
        const result = (response as unknown as { data: ProductDetailResponse })?.data ?? response;
        return result as ProductDetailResponse;
    },

    /**
     * Lấy danh sách sản phẩm liên quan cùng danh mục
     * GET /products/{id}/related
     */
    getRelatedProducts: async (id: number | string, limit: number = 6): Promise<ProductResponse[]> => {
        const response = await api.get<ProductResponse[]>(`/products/${id}/related`, {
            params: { limit },
        });
        const result = (response as unknown as { data: ProductResponse[] })?.data ?? response;
        return result as ProductResponse[];
    },
};
