import { create } from "zustand";
import { categoryApi } from "../api";
import type {
  Category,
  CategoryCreate,
  CategorySortBy,
  CategoryStats,
  CategoryUpdate,
} from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";

/** Lấy message lỗi từ response backend (BadRequest / NotFound / Duplicate...) */
const getErrorMessage = (error: unknown, fallback: string): string => {
  return parseErrorMessage(error, fallback);
};


interface CategoryState {
  // ---------- Public ----------
  categories: Category[]; // get_public_categories
  currentCategory: Category | null; // get_category_by_slug

  // ---------- Admin ----------
  adminCategories: CategoryStats[]; // get_admin_categories
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: CategorySortBy;

  // ---------- Trạng thái chung ----------
  isLoading: boolean; // đang tải dữ liệu
  isSubmitting: boolean; // đang tạo / sửa / xóa
  error: string | null;

  // ---------- Actions Public ----------
  fetchCategories: (parentId?: number | null) => Promise<void>;
  fetchCategoryBySlug: (slug: string) => Promise<void>;

  // ---------- Actions Admin ----------
  fetchAdminCategories: () => Promise<void>;
  createCategory: (payload: CategoryCreate) => Promise<Category>;
  updateCategory: (id: number, payload: CategoryUpdate) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  bulkDeleteCategories: (ids: number[]) => Promise<void>;

  // ---------- Bộ lọc / phân trang ----------
  setSearch: (search: string) => void;
  setSortBy: (sortBy: CategorySortBy) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,

  adminCategories: [],
  total: 0,
  totalPages: 1,
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "id_desc",

  isLoading: false,
  isSubmitting: false,
  error: null,

  // ===================== PUBLIC =====================
  fetchCategories: async (parentId) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryApi.getCategories(parentId);
      set({ categories });
    } catch (error) {
      set({ error: getErrorMessage(error, "Không thể tải danh sách danh mục") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategoryBySlug: async (slug) => {
    set({ isLoading: true, error: null, currentCategory: null });
    try {
      const currentCategory = await categoryApi.getCategoryBySlug(slug);
      set({ currentCategory });
    } catch (error) {
      set({ error: getErrorMessage(error, "Không tìm thấy danh mục") });
    } finally {
      set({ isLoading: false });
    }
  },

  // ===================== ADMIN =====================
  fetchAdminCategories: async () => {
    const { page, pageSize, search, sortBy } = get();
    set({ isLoading: true, error: null });
    try {
      const result = await categoryApi.getAdminCategories({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        sort_by: sortBy,
      });
      set({
        adminCategories: result.items,
        total: result.total,
        totalPages: result.total_pages,
      });
    } catch (error) {
      set({ error: getErrorMessage(error, "Không thể tải danh sách danh mục") });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create / update / delete: lưu error vào store rồi ném lại lỗi
  // để UI (modal, toast) tự xử lý theo message backend trả về.
  createCategory: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const created = await categoryApi.createCategory(payload);
      await get().fetchAdminCategories();
      return created;
    } catch (error) {
      set({ error: getErrorMessage(error, "Không thể tạo danh mục") });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateCategory: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await categoryApi.updateCategory(id, payload);
      await get().fetchAdminCategories();
      return updated;
    } catch (error) {
      set({ error: getErrorMessage(error, "Không thể cập nhật danh mục") });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await categoryApi.deleteCategory(id);
      // Nếu xóa bản ghi cuối của trang hiện tại thì lùi về trang trước
      const { adminCategories, page } = get();
      if (adminCategories.length === 1 && page > 1) set({ page: page - 1 });
      await get().fetchAdminCategories();
    } catch (error) {
      // Ví dụ: CATEGORY_HAS_PRODUCTS, CATEGORY_HAS_CHILDREN
      set({ error: getErrorMessage(error, "Không thể xóa danh mục") });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  bulkDeleteCategories: async (ids) => {
    set({ isSubmitting: true, error: null });
    try {
      await categoryApi.bulkDeleteCategories({ category_ids: ids });
      const { adminCategories, page } = get();
      if (ids.length >= adminCategories.length && page > 1) {
        set({ page: page - 1 });
      }
      await get().fetchAdminCategories();
    } catch (error) {
      set({ error: getErrorMessage(error, "Không thể xóa các danh mục đã chọn") });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ===================== BỘ LỌC =====================
  // Đổi tìm kiếm / sắp xếp thì quay về trang 1. UI tự gọi fetchAdminCategories().
  setSearch: (search) => set({ search, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  clearError: () => set({ error: null }),
}));