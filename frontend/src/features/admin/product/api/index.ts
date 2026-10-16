import api from "@/lib/axios/client";
import {
    ProductResponse,
    ProductDetailResponse,
    PriceOptionDTO,
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
     * Lấy danh sách sản phẩm quản trị (Admin) có phân trang và bộ lọc tồn kho.
     * GET /admin/products
     */
    getAdminProducts: async (
        params?: AdminProductQueryParams
    ): Promise<PaginatedProductResponse> => {
        const response = await api.get<PaginatedProductResponse>("/admin/products", {
            params,
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
        formData.append("product_name", payload.product_name);
        formData.append("category_id", String(payload.category_id));
        formData.append("price", String(payload.price));

        if (payload.sale_price !== undefined && payload.sale_price !== null) {
            formData.append("sale_price", String(payload.sale_price));
        }
        if (payload.quantity !== undefined && payload.quantity !== null) {
            formData.append("quantity", String(payload.quantity));
        }
        if (payload.brand) formData.append("brand", payload.brand);
        if (payload.origin) formData.append("origin", payload.origin);
        if (payload.description) formData.append("description", payload.description);
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
        if (payload.product_name !== undefined && payload.product_name !== null) {
            formData.append("product_name", payload.product_name);
        }
        if (payload.category_id !== undefined && payload.category_id !== null) {
            formData.append("category_id", String(payload.category_id));
        }
        if (payload.price !== undefined && payload.price !== null) {
            formData.append("price", String(payload.price));
        }
        if (payload.sale_price !== undefined && payload.sale_price !== null) {
            formData.append("sale_price", String(payload.sale_price));
        }
        if (payload.quantity !== undefined && payload.quantity !== null) {
            formData.append("quantity", String(payload.quantity));
        }
        if (payload.brand !== undefined && payload.brand !== null) {
            formData.append("brand", payload.brand);
        }
        if (payload.origin !== undefined && payload.origin !== null) {
            formData.append("origin", payload.origin);
        }
        if (payload.description !== undefined && payload.description !== null) {
            formData.append("description", payload.description);
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
