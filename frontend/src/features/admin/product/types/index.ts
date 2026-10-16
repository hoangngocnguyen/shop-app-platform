// 1. Base interface chứa các thuộc tính dùng chung
export interface ProductBase {
    product_name: string;
    price: number;
    sale_price?: number | null;
    quantity?: number;
    brand?: string | null;
    origin?: string | null;
    image_src?: string | null;
    image_public_id?: string | null;
    description?: string | null;
}

// 2. Request Schemas
export interface ProductCreate extends ProductBase {
    category_id: number;
}
export type CreateProductRequest = ProductCreate;
export type ProductCreateRequest = ProductCreate;

export interface ProductUpdate {
    product_name?: string | null;
    category_id?: number | null;
    price?: number | null;
    sale_price?: number | null;
    quantity?: number | null;
    brand?: string | null;
    origin?: string | null;
    image_src?: string | null;
    image_public_id?: string | null;
    description?: string | null;
}
export type UpdateProductRequest = ProductUpdate;
export type ProductUpdateRequest = ProductUpdate;

export interface BulkDeleteProductRequest {
    product_ids: number[];
}

export type StockStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";

export type ProductSortBy =
    | "id_desc"
    | "price_asc"
    | "price_desc"
    | "quantity_asc"
    | "quantity_desc";

export interface AdminProductQueryParams {
    page?: number;
    page_size?: number;
    category_id?: number | null;
    search?: string | null;
    stock_status?: StockStatus;
    sort_by?: ProductSortBy | string;
}

export type ProductClientSortBy =
    | "newest"
    | "price_asc"
    | "price_desc"
    | "best_seller";

export interface ProductQueryParams {
    page?: number;
    page_size?: number;
    category_slug?: string | null;
    search?: string | null;
    price_option?: string | null;
    min_price?: number | null;
    max_price?: number | null;
    sort_by?: ProductClientSortBy | string;
}

// 3. Response Schemas
export interface CategoryResponse {
    category_id: number;
    category_name: string;
    parent_id?: number | null;
    slug: string;
}

export interface ProductResponse extends ProductBase {
    product_id: number;
    quantity: number;
    category_id?: number | null;
    discount_percent?: number | null;
    rating?: number | null;
    sold?: number;
}

export interface ProductDetailResponse extends ProductResponse {
    category?: CategoryResponse | null;
}

export interface PriceOptionDTO {
    key: string;
    label: string;
    min: number;
    max?: number | null;
}

export interface PaginatedProductResponse {
    items: ProductResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface DeleteProductResponse {
    deleted_id: number;
}

export interface BulkDeleteProductResponse {
    deleted_count: number;
    product_ids: number[];
}
