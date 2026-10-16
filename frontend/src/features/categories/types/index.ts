export interface CategoryResponse {
    category_id: number;
    category_name: string;
    parent_id: number | null;
    slug: string;
}

export interface CategoryTreeResponse extends CategoryResponse {
    children?: CategoryResponse[];
}
