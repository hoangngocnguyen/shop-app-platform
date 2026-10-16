import api from "@/lib/axios/client";
import { CategoryResponse } from "../types";

export const categoryApi = {
    /**
     * Lấy danh sách tất cả danh mục sản phẩm (Client)
     * GET /categories
     */
    getCategories: async (parentId?: number | null): Promise<CategoryResponse[]> => {
        const response = await api.get<CategoryResponse[]>("/categories", {
            params: parentId !== undefined && parentId !== null ? { parent_id: parentId } : {},
        });
        return response.data;
    },

    /**
     * Lấy chi tiết danh mục theo slug
     * GET /categories/{slug}
     */
    getCategoryBySlug: async (slug: string): Promise<CategoryResponse> => {
        const response = await api.get<CategoryResponse>(`/categories/${slug}`);
        return response.data;
    },
};
