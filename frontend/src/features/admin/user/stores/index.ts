import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { adminUserApi } from "../api";
import {
  AdminUserQueryParams,
  SortDirection,
  UserBlockForm,
  UserDetailResponse,
  UserListResponse,
  UserRoleUpdateForm,
  UserStatsResponse,
} from "../types";

interface AdminUserState {
  // State dữ liệu
  users: UserDetailResponse[];
  selectedUser: UserDetailResponse | null;
  total: number;
  totalPages: number;
  stats: UserStatsResponse;

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
  fetchUserStats: () => Promise<UserStatsResponse | null>;
  fetchUserById: (userId: string | number) => Promise<UserDetailResponse | null>;
  blockUser: (userId: string | number, form: UserBlockForm) => Promise<boolean>;
  updateUserRole: (userId: string | number, form: UserRoleUpdateForm) => Promise<boolean>;
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
  stats: { total: 0, customers: 0, admins: 0, staff: 0, blocked: 0 },
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

  fetchUserStats: async () => {
    try {
      const stats = await adminUserApi.getUserStats();
      set({ stats });
      return stats;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể tải số liệu người dùng");
      set({ error: errorMessage });
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

  blockUser: async (userId: string | number, form: UserBlockForm) => {
    set({ isSubmitting: true, error: null });
    try {
      const updatedUser = await adminUserApi.blockUser(userId, form);
      set((state) => ({
        users: state.users.map((user) =>
          String(user.userId) === String(userId) ? updatedUser : user,
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? updatedUser
            : state.selectedUser,
        isSubmitting: false,
      }));
      await get().fetchUsers();
      await get().fetchUserStats();
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể thay đổi trạng thái tài khoản");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  updateUserRole: async (userId: string | number, form: UserRoleUpdateForm) => {
    set({ isSubmitting: true, error: null });
    try {
      const updatedUser = await adminUserApi.updateUserRole(userId, form);
      set((state) => ({
        users: state.users.map((user) =>
          String(user.userId) === String(userId) ? updatedUser : user,
        ),
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? updatedUser
            : state.selectedUser,
        isSubmitting: false,
      }));
      await get().fetchUsers();
      await get().fetchUserStats();
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể cập nhật vai trò người dùng");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

  deleteUser: async (userId: string | number) => {
    set({ isSubmitting: true, error: null });
    try {
      await adminUserApi.deleteUser(userId);
      set((state) => ({
        users: state.users.filter((user) => String(user.userId) !== String(userId)),
        total: Math.max(0, state.total - 1),
        selectedUser:
          state.selectedUser && String(state.selectedUser.userId) === String(userId)
            ? null
            : state.selectedUser,
        isSubmitting: false,
      }));
      return true;
    } catch (err: unknown) {
      const errorMessage = parseErrorMessage(err, "Không thể xóa tài khoản người dùng");
      set({ error: errorMessage, isSubmitting: false });
      return false;
    }
  },

}));
