import { create } from "zustand";
import { adminUserApi } from "../api";
import {
  AdminUserQueryParams,
  SortDirection,
  UserBlockForm,
  UserCreateForm,
  UserDetailResponse,
  UserUpdateForm,
} from "../types";

interface AdminUserState {
  // State dữ liệu
  users: UserDetailResponse[];
  selectedUser: UserDetailResponse | null;
  total: number;
  totalPages: number;

  // State bộ lọc & phân trang
  queryParams: AdminUserQueryParams;

  // State giao diện & trạng thái HTTP
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions xử lý logic
  fetchUsers: (customParams?: Partial<AdminUserQueryParams>) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  createUser: (form: UserCreateForm) => Promise<boolean>;
  updateUser: (userId: string, form: UserUpdateForm) => Promise<boolean>;
  blockUser: (userId: string, form: UserBlockForm) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;

  // Actions thao tác State bộ lọc & Modal
  setQueryParams: (params: Partial<AdminUserQueryParams>) => void;
  resetQueryParams: () => void;
  setSelectedUser: (user: UserDetailResponse | null) => void;
  clearError: () => void;
}

const initialQueryParams: AdminUserQueryParams = {
  page: 0,
  page_size: 10,
  search: "",
  role: undefined,
  status: undefined,
  sortBy: "createdAt",
  sortDir: SortDirection.DESC,
};

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  // Dữ liệu ban đầu
  users: [],
  selectedUser: null,
  total: 0,
  totalPages: 0,
  queryParams: initialQueryParams,
  isLoading: false,
  isSubmitting: false,
  error: null,

  /**
   * 1. Lấy danh sách người dùng (kèm phân trang, lọc, tìm kiếm)
   */
  fetchUsers: async (customParams?: Partial<AdminUserQueryParams>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams = { ...get().queryParams, ...customParams };
      const response = await adminUserApi.getUsers(mergedParams);

      set({
        users: response.data.content,
        total: response.data.total,
        totalPages: response.data.total_pages,
        queryParams: mergedParams,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Không thể tải danh sách người dùng",
        isLoading: false,
      });
    }
  },

  /**
   * 2. Lấy thông tin chi tiết một người dùng
   */
  fetchUserById: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminUserApi.getUserById(userId);
      set({ selectedUser: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Không thể lấy thông tin người dùng",
        isLoading: false,
      });
    }
  },

  /**
   * 3. Tạo người dùng mới
   */
  createUser: async (form: UserCreateForm) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.createUser(form);
      set({ isSubmitting: false });
      // Reload lại danh sách sau khi tạo thành công
      await get().fetchUsers({ page: 0 });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Tạo tài khoản thất bại",
        isSubmitting: false,
      });
      return false;
    }
  },

  /**
   * 4. Cập nhật thông tin người dùng
   */
  updateUser: async (userId: string, form: UserUpdateForm) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.updateUser(userId, form);
      set({ isSubmitting: false });
      // Reload lại danh sách người dùng
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Cập nhật thông tin thất bại",
        isSubmitting: false,
      });
      return false;
    }
  },

  /**
   * 5. Khóa hoặc Mở khóa tài khoản
   */
  blockUser: async (userId: string, form: UserBlockForm) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.blockUser(userId, form);
      set({ isSubmitting: false });
      // Reload lại danh sách
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Thao tác khóa/mở khóa thất bại",
        isSubmitting: false,
      });
      return false;
    }
  },

  /**
   * 6. Xóa tài khoản người dùng
   */
  deleteUser: async (userId: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.deleteUser(userId);
      set({ isSubmitting: false });
      // Reload lại danh sách người dùng
      await get().fetchUsers();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Không thể xóa người dùng",
        isSubmitting: false,
      });
      return false;
    }
  },

  // Cập nhật bộ lọc và kích hoạt gọi lại API
  setQueryParams: (params: Partial<AdminUserQueryParams>) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    }));
  },

  // Reset bộ lọc về trạng thái ban đầu
  resetQueryParams: () => {
    set({ queryParams: initialQueryParams });
    get().fetchUsers(initialQueryParams);
  },

  // Set user đang được chọn để sửa / khóa / xem chi tiết
  setSelectedUser: (user: UserDetailResponse | null) => set({ selectedUser: user }),

  // Xóa thông báo lỗi
  clearError: () => set({ error: null }),
}));