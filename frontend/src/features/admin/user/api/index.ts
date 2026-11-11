import api from "@/lib/axios/client";
import type {
  AdminUserQueryParams,
  UserListResponse,
  UserDetailResponse,
  UserBlockForm,
  UserRoleUpdateForm,
  UserStatsResponse,
  UserDetailStatisticsResponse,
  UserStatisticsQueryParams,
} from "../types";

const ENDPOINT = "/admin/users";

export const adminUserApi = {
  /** 1. Lấy danh sách người dùng (GET /admin/users) */
  getUsers: async (params?: AdminUserQueryParams): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>(ENDPOINT, { params });
    return response.data;
  },

  /** 2. Xem chi tiết người dùng (GET /admin/users/{userId}) */
  getUserById: async (userId: string | number): Promise<UserDetailResponse> => {
    const response = await api.get<UserDetailResponse>(`${ENDPOINT}/${userId}`);
    return response.data;
  },

  /** 3. Lấy thống kê chi tiết & lịch sử đơn hàng (GET /admin/users/{userId}/statistics) */
  getUserStatistics: async (
    userId: string | number,
    params?: UserStatisticsQueryParams,
  ): Promise<UserDetailStatisticsResponse> => {
    const response = await api.get<UserDetailStatisticsResponse>(
      `${ENDPOINT}/${userId}/statistics`,
      { params },
    );
    return response.data;
  },

  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await api.get<UserStatsResponse>(`${ENDPOINT}/stats`);
    return response.data;
  },

  deleteUser: async (userId: string | number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${userId}`);
  },

  blockUser: async (
    userId: string | number,
    form: UserBlockForm,
  ): Promise<UserDetailResponse> => {
    const response = await api.patch<UserDetailResponse>(`${ENDPOINT}/${userId}/block`, form);
    return response.data;
  },

  updateUserRole: async (
    userId: string | number,
    form: UserRoleUpdateForm,
  ): Promise<UserDetailResponse> => {
    const response = await api.patch<UserDetailResponse>(`${ENDPOINT}/${userId}/role`, form);
    return response.data;
  },
};