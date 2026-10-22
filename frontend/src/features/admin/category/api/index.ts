import api from "@/lib/axios/client";
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryPaginationParams,
  PaginatedCategoryStats,
  DeleteCategoryResponse,
  BulkDeleteCategoryResponse,
  BulkDeleteCategoryRequest,
} from "../types";

export const categoryApi = {
  // ==========================================================================
  // CLIENT / PUBLIC APIS
  // ==========================================================================

  /**
   * GET /categories
   * Lấy danh sách danh mục (Client).
   * Truyền parent_id để lọc danh mục con, bỏ trống để lấy toàn bộ.
   */
  getCategories: async (parentId?: number | null): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories", {
      params: parentId != null ? { parent_id: parentId } : undefined,
    });
    return response.data;
  },

  /**
   * GET /categories/{slug}
   * Lấy chi tiết danh mục theo slug (backend trả 404 nếu không tìm thấy).
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<Category>(
      `/categories/${encodeURIComponent(slug)}`
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN APIS
  // ==========================================================================

  /**
   * GET /admin/categories
   * Danh sách danh mục dành cho Admin (Có phân trang, tìm kiếm, sắp xếp).
   */
  getAdminCategories: async (
    params?: CategoryPaginationParams
  ): Promise<PaginatedCategoryStats> => {
    const response = await api.get<PaginatedCategoryStats>(
      "/admin/categories",
      { params }
    );
    return response.data;
  },

  /**
   * POST /admin/categories
   * Tạo danh mục mới trong hệ thống.
   */
  createCategory: async (payload: CategoryCreate): Promise<Category> => {
    const response = await api.post<Category>("/admin/categories", payload);
    return response.data;
  },

  /**
   * PUT /admin/categories/{category_id}
   * Chỉnh sửa thông tin danh mục theo ID.
   */
  updateCategory: async (
    categoryId: number,
    payload: CategoryUpdate
  ): Promise<Category> => {
    const response = await api.put<Category>(
      `/admin/categories/${categoryId}`,
      payload
    );
    return response.data;
  },

  /**
   * DELETE /admin/categories/{category_id}
   * Xóa đơn lẻ danh mục theo ID.
   */
  deleteCategory: async (
    categoryId: number
  ): Promise<DeleteCategoryResponse> => {
    const response = await api.delete<DeleteCategoryResponse>(
      `/admin/categories/${categoryId}`
    );
    return response.data;
  },

  /**
   * POST /admin/categories/delete-multiple
   * Xóa hàng loạt danh mục theo danh sách ID.
   */
  bulkDeleteCategories: async (
    payload: BulkDeleteCategoryRequest
  ): Promise<BulkDeleteCategoryResponse> => {
    const response = await api.post<BulkDeleteCategoryResponse>(
      "/admin/categories/delete-multiple",
      payload
    );
    return response.data;
  },
};