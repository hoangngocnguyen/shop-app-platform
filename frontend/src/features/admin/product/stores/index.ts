import { create } from "zustand";
import { adminProductApi, productApi } from "../api";
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
import { parseErrorMessage } from "@/lib/axios/parseError";

interface ProductState {
    // State
    adminProducts: PaginatedProductResponse | null;
    publicProducts: PaginatedProductResponse | null;
    selectedProduct: ProductDetailResponse | null;
    relatedProducts: ProductResponse[];
    priceOptions: PriceOptionDTO[];
    isLoading: boolean;
    error: string | null;

    // Actions (Setters)
    setAdminProducts: (adminProducts: PaginatedProductResponse | null) => void;
    setPublicProducts: (publicProducts: PaginatedProductResponse | null) => void;
    setSelectedProduct: (product: ProductDetailResponse | null) => void;
    setRelatedProducts: (products: ProductResponse[]) => void;
    setPriceOptions: (options: PriceOptionDTO[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Async Actions - Quản trị sản phẩm (Admin Services)
    fetchAdminProducts: (params?: AdminProductQueryParams) => Promise<PaginatedProductResponse | null>;
    createProduct: (payload: ProductCreate, file?: File | null) => Promise<ProductResponse | null>;
    updateProduct: (
        id: number,
        payload: ProductUpdate,
        file?: File | null
    ) => Promise<ProductResponse | null>;
    deleteProduct: (id: number) => Promise<DeleteProductResponse | null>;
    bulkDeleteProducts: (
        payload: BulkDeleteProductRequest
    ) => Promise<BulkDeleteProductResponse | null>;

    // Async Actions - Khách hàng / Public (Public Services)
    fetchPublicProducts: (params?: ProductQueryParams) => Promise<PaginatedProductResponse | null>;
    fetchProducts: (params?: ProductQueryParams) => Promise<PaginatedProductResponse | null>;
    fetchPriceOptions: () => Promise<PriceOptionDTO[] | null>;
    fetchProductDetail: (id: number) => Promise<ProductDetailResponse | null>;
    fetchRelatedProducts: (id: number, limit?: number) => Promise<ProductResponse[] | null>;

    // Reset store về trạng thái mặc định
    reset: () => void;
}

const initialState = {
    adminProducts: null,
    publicProducts: null,
    selectedProduct: null,
    relatedProducts: [],
    priceOptions: [],
    isLoading: false,
    error: null,
};

export const useProductStore = create<ProductState>((set, get) => ({
    ...initialState,

    setAdminProducts: (adminProducts) => set({ adminProducts }),
    setPublicProducts: (publicProducts) => set({ publicProducts }),
    setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
    setRelatedProducts: (relatedProducts) => set({ relatedProducts }),
    setPriceOptions: (priceOptions) => set({ priceOptions }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // =========================================================================
    // 1. ADMIN SERVICES
    // =========================================================================

    // Lấy danh sách sản phẩm quản trị (Admin) có phân trang và bộ lọc tồn kho
    fetchAdminProducts: async (params?: AdminProductQueryParams) => {
        set({ isLoading: true, error: null });
        try {
            const data = await adminProductApi.getAdminProducts(params);
            set({ adminProducts: data, isLoading: false });
            return data;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy danh sách sản phẩm quản trị");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Thêm mới sản phẩm kèm ảnh tải lên Cloudinary
    createProduct: async (payload: ProductCreate, file?: File | null) => {
        set({ isLoading: true, error: null });
        try {
            const newProduct = await adminProductApi.createProduct(payload, file);
            set((state) => ({
                adminProducts: state.adminProducts
                    ? {
                          ...state.adminProducts,
                          items: [newProduct, ...state.adminProducts.items],
                          total: state.adminProducts.total + 1,
                      }
                    : null,
                isLoading: false,
            }));
            return newProduct;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tạo sản phẩm mới");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Cập nhật thông tin sản phẩm kèm ảnh mới
    updateProduct: async (id: number, payload: ProductUpdate, file?: File | null) => {
        set({ isLoading: true, error: null });
        try {
            const updatedProduct = await adminProductApi.updateProduct(id, payload, file);
            set((state) => ({
                adminProducts: state.adminProducts
                    ? {
                          ...state.adminProducts,
                          items: state.adminProducts.items.map((item) =>
                              item.product_id === id ? updatedProduct : item
                          ),
                      }
                    : null,
                selectedProduct:
                    state.selectedProduct?.product_id === id
                        ? { ...state.selectedProduct, ...updatedProduct }
                        : state.selectedProduct,
                isLoading: false,
            }));
            return updatedProduct;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể cập nhật thông tin sản phẩm");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa đơn lẻ một sản phẩm theo ID
    deleteProduct: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const result = await adminProductApi.deleteProduct(id);
            set((state) => ({
                adminProducts: state.adminProducts
                    ? {
                          ...state.adminProducts,
                          items: state.adminProducts.items.filter((item) => item.product_id !== id),
                          total: Math.max(0, state.adminProducts.total - 1),
                      }
                    : null,
                selectedProduct:
                    state.selectedProduct?.product_id === id ? null : state.selectedProduct,
                isLoading: false,
            }));
            return result;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa sản phẩm");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa hàng loạt nhiều sản phẩm theo danh sách ID
    bulkDeleteProducts: async (payload: BulkDeleteProductRequest) => {
        set({ isLoading: true, error: null });
        try {
            const result = await adminProductApi.bulkDeleteProducts(payload);
            const deletedSet = new Set(payload.product_ids);
            set((state) => ({
                adminProducts: state.adminProducts
                    ? {
                          ...state.adminProducts,
                          items: state.adminProducts.items.filter(
                              (item) => !deletedSet.has(item.product_id)
                          ),
                          total: Math.max(0, state.adminProducts.total - result.deleted_count),
                      }
                    : null,
                selectedProduct:
                    state.selectedProduct && deletedSet.has(state.selectedProduct.product_id)
                        ? null
                        : state.selectedProduct,
                isLoading: false,
            }));
            return result;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa các sản phẩm đã chọn");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // =========================================================================
    // 2. PUBLIC / CLIENT SERVICES
    // =========================================================================

    // Lọc và tìm kiếm danh sách sản phẩm phía Client
    fetchPublicProducts: async (params?: ProductQueryParams) => {
        set({ isLoading: true, error: null });
        try {
            const data = await productApi.getProducts(params);
            set({ publicProducts: data, isLoading: false });
            return data;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy danh sách sản phẩm");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Alias cho fetchPublicProducts
    fetchProducts: async (params?: ProductQueryParams) => {
        return get().fetchPublicProducts(params);
    },

    // Lấy metadata các dải giá cố định
    fetchPriceOptions: async () => {
        set({ isLoading: true, error: null });
        try {
            const priceOptions = await productApi.getPriceOptions();
            set({ priceOptions, isLoading: false });
            return priceOptions;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy danh sách dải giá");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Lấy thông tin chi tiết một sản phẩm theo ID kèm danh mục
    fetchProductDetail: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const product = await productApi.getProductDetail(id);
            set({ selectedProduct: product, isLoading: false });
            return product;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy thông tin chi tiết sản phẩm");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Lấy danh sách sản phẩm liên quan cùng danh mục
    fetchRelatedProducts: async (id: number, limit: number = 4) => {
        set({ isLoading: true, error: null });
        try {
            const relatedProducts = await productApi.getRelatedProducts(id, limit);
            set({ relatedProducts, isLoading: false });
            return relatedProducts;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy danh sách sản phẩm liên quan");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Reset toàn bộ store về trạng thái ban đầu
    reset: () => set(initialState),
}));

// Export thêm alias useAdminProductStore để linh hoạt khi import
export const useAdminProductStore = useProductStore;
