import api from "@/lib/axios/client";
import {
    ProductResponse,
    ProductDetailResponse,
    PriceOptionDTO,
    CategoryResponse,
    PaginatedProductResponse,
    ProductQueryParams,
    AdminProductQueryParams,
    ProductCreate,
    ProductUpdate,
    BulkDeleteProductRequest,
    DeleteProductResponse,
    BulkDeleteProductResponse,
} from "../types";

export type {
    ProductResponse,
    ProductDetailResponse,
    PriceOptionDTO,
    CategoryResponse,
    PaginatedProductResponse,
    ProductQueryParams,
    AdminProductQueryParams,
    ProductCreate,
    ProductUpdate,
    BulkDeleteProductRequest,
    DeleteProductResponse,
    BulkDeleteProductResponse,
};

export const adminProductApi = {
    /**
     * Lấy danh sách danh mục phục vụ chọn danh mục khi tạo/sửa hoặc lọc sản phẩm.
     * GET /categories
     */
    getCategories: async (): Promise<CategoryResponse[]> => {
        try {
            const response = await api.get<CategoryResponse[]>("/categories");
            return response.data || [];
        } catch {
            return [];
        }
    },

    /**
     * Lấy danh sách sản phẩm quản trị (Admin) có phân trang và bộ lọc tồn kho.
     * GET /admin/products
     * Params: page, page_size, category_id, search, stock_status, sort_by
     */
    getAdminProducts: async (
        params?: AdminProductQueryParams
    ): Promise<PaginatedProductResponse> => {
        const queryParams: Record<string, string | number> = {};
        if (params?.page) queryParams.page = params.page;
        if (params?.page_size) queryParams.page_size = params.page_size;
        if (params?.category_id) queryParams.category_id = params.category_id;
        if (params?.search && params.search.trim()) queryParams.search = params.search.trim();
        if (params?.stock_status && params.stock_status !== "all") {
            queryParams.stock_status = params.stock_status;
        }
        if (params?.sort_by) queryParams.sort_by = params.sort_by;

        const response = await api.get<PaginatedProductResponse>("/admin/products", {
            params: queryParams,
        });
        return response.data;
    },

    /**
     * Thêm mới sản phẩm kèm ảnh tải lên Cloudinary (Admin).
     * POST /admin/products (multipart/form-data)
     */
    createProduct: async (
        payload: ProductCreate,
        file?: File | null
    ): Promise<ProductResponse> => {
        const formData = new FormData();
        formData.append("product_name", payload.product_name.trim());
        formData.append("category_id", String(payload.category_id));
        formData.append("price", String(payload.price));

        if (
            payload.sale_price !== undefined &&
            payload.sale_price !== null &&
            Number(payload.sale_price) > 0
        ) {
            formData.append("sale_price", String(payload.sale_price));
        }

        formData.append("quantity", String(payload.quantity ?? 0));

        if (payload.brand && payload.brand.trim()) {
            formData.append("brand", payload.brand.trim());
        }
        if (payload.origin && payload.origin.trim()) {
            formData.append("origin", payload.origin.trim());
        }
        if (payload.description && payload.description.trim()) {
            formData.append("description", payload.description.trim());
        }
        if (file) {
            formData.append("file", file);
        }

        const response = await api.post<ProductResponse>("/admin/products", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Cập nhật thông tin sản phẩm kèm ảnh mới (Admin).
     * PUT /admin/products/{id} (multipart/form-data)
     */
    updateProduct: async (
        id: number,
        payload: ProductUpdate,
        file?: File | null
    ): Promise<ProductResponse> => {
        const formData = new FormData();

        if (
            payload.product_name !== undefined &&
            payload.product_name !== null &&
            payload.product_name.trim()
        ) {
            formData.append("product_name", payload.product_name.trim());
        }
        if (payload.category_id !== undefined && payload.category_id !== null) {
            formData.append("category_id", String(payload.category_id));
        }
        if (payload.price !== undefined && payload.price !== null) {
            formData.append("price", String(payload.price));
        }
        if (
            payload.sale_price !== undefined &&
            payload.sale_price !== null &&
            Number(payload.sale_price) > 0
        ) {
            formData.append("sale_price", String(payload.sale_price));
        }
        if (payload.quantity !== undefined && payload.quantity !== null) {
            formData.append("quantity", String(payload.quantity));
        }
        if (
            payload.brand !== undefined &&
            payload.brand !== null &&
            payload.brand.trim()
        ) {
            formData.append("brand", payload.brand.trim());
        }
        if (
            payload.origin !== undefined &&
            payload.origin !== null &&
            payload.origin.trim()
        ) {
            formData.append("origin", payload.origin.trim());
        }
        if (
            payload.description !== undefined &&
            payload.description !== null &&
            payload.description.trim()
        ) {
            formData.append("description", payload.description.trim());
        }
        if (file) {
            formData.append("file", file);
        }

        const response = await api.put<ProductResponse>(`/admin/products/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Xóa đơn lẻ một sản phẩm theo ID (Admin).
     * DELETE /admin/products/{id}
     */
    deleteProduct: async (id: number): Promise<DeleteProductResponse> => {
        const response = await api.delete<DeleteProductResponse>(`/admin/products/${id}`);
        return response.data;
    },

    /**
     * Xóa hàng loạt nhiều sản phẩm theo danh sách ID (Admin).
     * POST /admin/products/delete-multiple
     */
    bulkDeleteProducts: async (
        payload: BulkDeleteProductRequest
    ): Promise<BulkDeleteProductResponse> => {
        const response = await api.post<BulkDeleteProductResponse>(
            "/admin/products/delete-multiple",
            payload
        );
        return response.data;
    },
};

export const productApi = {
    /**
     * Lấy metadata các dải giá cố định (Client).
     * GET /products/price-options
     */
    getPriceOptions: async (): Promise<PriceOptionDTO[]> => {
        const response = await api.get<PriceOptionDTO[]>("/products/price-options");
        return response.data;
    },

    /**
     * Lọc và tìm kiếm danh sách sản phẩm (Client).
     * GET /products
     */
    getProducts: async (params?: ProductQueryParams): Promise<PaginatedProductResponse> => {
        const response = await api.get<PaginatedProductResponse>("/products", {
            params,
        });
        return response.data;
    },

    /**
     * Lấy chi tiết một sản phẩm theo ID (Client).
     * GET /products/{id}
     */
    getProductDetail: async (id: number): Promise<ProductDetailResponse> => {
        const response = await api.get<ProductDetailResponse>(`/products/${id}`);
        return response.data;
    },

    /**
     * Lấy danh sách sản phẩm liên quan (Client).
     * GET /products/{id}/related
     */
    getRelatedProducts: async (id: number, limit: number = 4): Promise<ProductResponse[]> => {
        const response = await api.get<ProductResponse[]>(`/products/${id}/related`, {
            params: { limit },
        });
        return response.data;
    },
};
