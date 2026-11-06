import api from "@/lib/axios/client";
import type {
  AdminUserQueryParams,
  UserListResponse,
  UserDetailResponse,
  UserCreateForm,
  UserUpdateForm,
  UserBlockForm,
} from "../types";

const ENDPOINT = "/admin/users";

export const adminUserApi = {
  /** 1. Lấy danh sách người dùng (GET /admin/users) */
  getUsers: async (params?: AdminUserQueryParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(ENDPOINT, { params });
    return response.data;
  },

  /** 2. Tạo mới người dùng (POST /admin/users) */
  createUser: async (form: UserCreateForm): Promise<UserDetailResponse> => {
    const response = await api.post<UserDetailResponse>(ENDPOINT, form);
    return response.data;
  },

  /** 3. Xem chi tiết người dùng (GET /admin/users/{userId}) */
  getUserById: async (userId: string | number): Promise<UserDetailResponse> => {
    const response = await api.get<UserDetailResponse>(`${ENDPOINT}/${userId}`);
    return response.data;
  },

  /** 4. Cập nhật thông tin (PUT /admin/users/{userId}) */
  updateUser: async (
    userId: string | number,
    form: UserUpdateForm
  ): Promise<UserDetailResponse> => {
    const response = await api.put<UserDetailResponse>(`${ENDPOINT}/${userId}`, form);
    return response.data;
  },

  /** 5. Khóa hoặc Mở khóa tài khoản (PATCH /admin/users/{userId}/block) */
  blockUser: async (
    userId: string | number,
    form: UserBlockForm
  ): Promise<UserDetailResponse> => {
    const response = await api.patch<UserDetailResponse>(`${ENDPOINT}/${userId}/block`, form);
    return response.data;
  },

  /** 6. Xóa tài khoản (DELETE /admin/users/{userId}) */
  deleteUser: async (userId: string | number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${userId}`);
  },
};