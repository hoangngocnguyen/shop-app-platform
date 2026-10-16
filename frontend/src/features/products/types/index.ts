import { CategoryResponse } from "@/features/categories/types";

export interface ProductResponse {
    product_id: number;
    product_name: string;
    price: number | string;
    sale_price: number | string | null;
    discount_percent: number | null;
    quantity: number;
    sold: number;
    rating: number | string | null;
    brand: string | null;
    origin: string | null;
    image_src: string | null;
    image_public_id: string | null;
    description: string | null;
    category_id: number | null;
}

export interface ProductDetailResponse extends ProductResponse {
    category: CategoryResponse | null;
}

export interface PriceOptionDTO {
    key: string;
    label: string;
    min: number | string;
    max: number | string | null;
}

export interface ProductFilterParams {
    page?: number;
    page_size?: number;
    category_slug?: string;
    search?: string;
    price_option?: string;
    min_price?: number | string;
    max_price?: number | string;
    sort_by?: "newest" | "price_asc" | "price_desc" | "best_seller";
}

export interface PaginatedProducts {
    items: ProductResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
