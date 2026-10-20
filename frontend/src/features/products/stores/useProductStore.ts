import { create } from "zustand";
import { productApi } from "../api";
import {
    ProductResponse,
    ProductDetailResponse,
    PriceOptionDTO,
    ProductFilterParams,
    PaginatedProducts,
} from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";

interface ProductState {
    // Danh sách sản phẩm
    products: ProductResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;

    // Bộ lọc & Dải giá
    filterParams: ProductFilterParams;
    priceOptions: PriceOptionDTO[];
    isLoadingPriceOptions: boolean;

    // Chi tiết sản phẩm
    currentProduct: ProductDetailResponse | null;
    isLoadingDetail: boolean;
    detailError: string | null;

    // Sản phẩm liên quan
    relatedProducts: ProductResponse[];
    isLoadingRelated: boolean;

    // Actions
    fetchProducts: (overrideParams?: Partial<ProductFilterParams>) => Promise<PaginatedProducts | null>;
    loadMoreProducts: () => Promise<PaginatedProducts | null>;
    fetchPriceOptions: () => Promise<PriceOptionDTO[] | null>;
    fetchProductDetail: (id: number | string) => Promise<ProductDetailResponse | null>;
    fetchRelatedProducts: (id: number | string, limit?: number) => Promise<ProductResponse[] | null>;
    setFilter: (newFilter: Partial<ProductFilterParams>) => void;
    resetFilter: () => void;
    setCurrentProduct: (product: ProductDetailResponse | null) => void;
}

const DEFAULT_FILTERS: ProductFilterParams = {
    page: 1,
    page_size: 12,
    sort_by: "newest",
    search: "",
    category_slug: undefined,
    price_option: undefined,
};

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
    isLoading: false,
    isLoadingMore: false,
    error: null,

    filterParams: DEFAULT_FILTERS,
    priceOptions: [],
    isLoadingPriceOptions: false,

    currentProduct: null,
    isLoadingDetail: false,
    detailError: null,

    relatedProducts: [],
    isLoadingRelated: false,

    setCurrentProduct: (product) => set({ currentProduct: product }),

    setFilter: (newFilter) => {
        set((state) => ({
            filterParams: {
                ...state.filterParams,
                ...newFilter,
                // Khi thay đổi bộ lọc (trừ page), reset về trang 1
                page: newFilter.page !== undefined ? newFilter.page : 1,
            },
        }));
        // Tự động fetch lại sau khi cập nhật filter
        get().fetchProducts();
    },

    resetFilter: () => {
        set({ filterParams: DEFAULT_FILTERS });
        get().fetchProducts();
    },

    fetchProducts: async (overrideParams) => {
        const currentFilters = {
            ...get().filterParams,
            ...(overrideParams || {}),
        };

        set({ isLoading: true, error: null });
        try {
            const data = await productApi.getProducts(currentFilters);
            set({
                products: data?.items || [],
                total: data?.total || 0,
                page: data?.page || 1,
                pageSize: data?.page_size || 12,
                totalPages: data?.total_pages || 1,
                isLoading: false,
            });
            return data;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tải danh sách sản phẩm");
            set({ error: errorMessage, isLoading: false, products: [] });
            return null;
        }
    },

    loadMoreProducts: async () => {
        const { page, totalPages, isLoadingMore, isLoading, filterParams, products } = get();
        // Không load nếu đã hết trang hoặc đang loading
        if (page >= totalPages || isLoadingMore || isLoading) {
            return null;
        }

        const nextPage = page + 1;
        set({ isLoadingMore: true });

        try {
            const data = await productApi.getProducts({
                ...filterParams,
                page: nextPage,
            });

            if (data?.items) {
                // Lọc bỏ trùng lặp id nếu có
                const existingIds = new Set(products.map((p) => p.product_id));
                const newItems = data.items.filter((p) => !existingIds.has(p.product_id));

                set({
                    products: [...products, ...newItems],
                    total: data.total ?? get().total,
                    page: data.page ?? nextPage,
                    pageSize: data.page_size ?? get().pageSize,
                    totalPages: data.total_pages ?? totalPages,
                    isLoadingMore: false,
                });
            } else {
                set({ isLoadingMore: false });
            }
            return data;
        } catch (err: unknown) {
            console.error("Lỗi khi tải thêm sản phẩm:", err);
            set({ isLoadingMore: false });
            return null;
        }
    },

    fetchPriceOptions: async () => {
        set({ isLoadingPriceOptions: true });
        try {
            const options = await productApi.getPriceOptions();
            set({ priceOptions: Array.isArray(options) ? options : [], isLoadingPriceOptions: false });
            return options;
        } catch (err) {
            console.error("Lỗi khi tải metadata dải giá:", err);
            set({ isLoadingPriceOptions: false });
            return null;
        }
    },

    fetchProductDetail: async (id) => {
        set({ isLoadingDetail: true, detailError: null });
        try {
            const product = await productApi.getProductDetail(id);
            set({ currentProduct: product, isLoadingDetail: false });
            return product;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tải thông tin chi tiết sản phẩm");
            set({ detailError: errorMessage, isLoadingDetail: false });
            return null;
        }
    },

    fetchRelatedProducts: async (id, limit = 6) => {
        set({ isLoadingRelated: true });
        try {
            const related = await productApi.getRelatedProducts(id, limit);
            set({ relatedProducts: Array.isArray(related) ? related : [], isLoadingRelated: false });
            return related;
        } catch (err) {
            console.error("Lỗi khi tải sản phẩm liên quan:", err);
            set({ isLoadingRelated: false });
            return null;
        }
    },
}));
