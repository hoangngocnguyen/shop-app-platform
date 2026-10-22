export interface Category {
  category_id: number;
  category_name: string;
  parent_id: number | null;
  slug: string;
}

export interface CategoryStats extends Category {
  product_count: number;
}

export interface CategoryCreate {
  category_name: string;
  parent_id?: number | null;
  slug?: string | null;
}

export interface CategoryUpdate {
  category_name?: string | null;
  parent_id?: number | null;
  slug?: string | null;
}

export type CategorySortBy = "id_desc" | "name_asc" | "name_desc";

export interface CategoryPaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: CategorySortBy;
}

export interface PaginatedCategoryStats {
  items: CategoryStats[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DeleteCategoryResponse {
  deleted_id: number;
}

export interface BulkDeleteCategoryRequest {
  category_ids: number[];
}

export interface BulkDeleteCategoryResponse {
  deleted_count: number;
  category_ids: number[];
}
