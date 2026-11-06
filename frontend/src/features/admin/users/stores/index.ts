import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { adminUserApi } from "../api";
import {
  AdminUserQueryParams,
  SortDirection,
  UserBlockForm,
  UserCreateForm,
  UserDetailResponse,
  UserListResponse,
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

  // Actions (Setters & Reset)
  setUsers: (users: UserDetailResponse[]) => void;
  setSelectedUser: (user: UserDetailResponse | null) => void;
  setQueryParams: (params: Partial<AdminUserQueryParams>) => void;
  resetQueryParams: () => void;
  clearError: () => void;
  reset: () => void;

  // Async Actions - Admin User Services
  fetchUsers: (customParams?: Partial<AdminUserQueryParams>) => Promise<UserListResponse | null>;
  fetchUserById: (userId: string | number) => Promise<UserDetailResponse | null>;
  createUser: (form: UserCreateForm) => Promise<boolean>;
  updateUser: (userId: string | number, form: UserUpdateForm) => Promise<boolean>;
  blockUser: (userId: string | number, form: UserBlockForm) => Promise<boolean>;
  deleteUser: (userId: string | number) => Promise<boolean>;
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

const initialState = {
  users: [],
  selectedUser: null,
  total: 0,
  totalPages: 0,
  queryParams: initialQueryParams,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  ...initialState,

  setUsers: (users) => set({ users }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setQueryParams: (params) =>
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    })),

  resetQueryParams: () => {
    set({ queryParams: initialQueryParams });
    void get().fetchUsers(initialQueryParams);
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),

  /** 1. Lấy danh sách người dùng (kèm phân trang, lọc, tìm kiếm) */
  fetchUsers: async (customParams?: Partial<AdminUserQueryParams>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams = { ...get().queryParams, ...customParams };
      const data = await adminUserApi.getUsers(mergedParams);

      set({
        users: data?.content ?? [],
        total: data?.total ?? 0,
        totalPages: data?.total_pages ?? 0,
        queryParams: mergedParams,
        isLoading: false,
      });
      return data;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể tải danh sách người dùng");
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /** 2. Lấy thông tin chi tiết một người dùng */
  fetchUserById: async (userId: string | number) => {
    set({ isLoading: true, error: null });
    try {
      const user = await adminUserApi.getUserById(userId);
      set({ selectedUser: user, isLoading: false });
      return user;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể lấy thông tin người dùng");
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  /** 3. Tạo người dùng mới */
  createUser: async (form: UserCreateForm) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.createUser(form);
      set({ isSubmitting: false });
      await get().fetchUsers({ page: 0 });
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Tạo tài khoản thất bại");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  /** 4. Cập nhật thông tin người dùng */
  updateUser: async (userId: string | number, form: UserUpdateForm) => {
    set({ isSubmitting: true, error: null });
    try {
      const updatedUser = await adminUserApi.updateUser(userId, form);

      set((state) => ({
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? updatedUser
            : state.selectedUser,
        isSubmitting: false,
      }));

      await get().fetchUsers();
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Cập nhật thông tin thất bại");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  /** 5. Khóa hoặc Mở khóa tài khoản */
  blockUser: async (userId: string | number, form: UserBlockForm) => {
    set({ isSubmitting: true, error: null });
    try {
      const updatedUser = await adminUserApi.blockUser(userId, form);

      set((state) => ({
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? updatedUser
            : state.selectedUser,
        isSubmitting: false,
      }));

      await get().fetchUsers();
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Thao tác khóa/mở khóa thất bại");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  /** 6. Xóa tài khoản người dùng */
  deleteUser: async (userId: string | number) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.deleteUser(userId);
      set((state) => ({
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? null
            : state.selectedUser,
        isSubmitting: false,
      }));

      await get().fetchUsers();
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể xóa người dùng");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },
}));
