import axios from "axios";
import {
  ApiResponse,
  AdminUserQueryParams,
  UserListResponse,
  UserDetailResponse,
  UserCreateForm,
  UserUpdateForm,
  UserBlockForm,
} from "../types";

// Base API URL của Admin User Module (thay đổi baseURL nếu dự án có axios instance dùng chung)
const BASE_URL = "http://127.0.0.1:8000/api/v1/admin/users";

export const adminUserApi = {
  /**
   * 1. Lấy danh sách người dùng (Phân trang, Tìm kiếm, Lọc theo Role/Status, Sắp xếp)
   * HTTP Method: GET /api/v1/admin/users
   */
  getUsers: async (params?: AdminUserQueryParams): Promise<ApiResponse<UserListResponse>> => {
    const response = await axios.get<ApiResponse<UserListResponse>>(BASE_URL, {
      params,
    });
    return response.data;
  },

  /**
   * 2. Tạo người dùng mới
   * HTTP Method: POST /api/v1/admin/users
   */
  createUser: async (form: UserCreateForm): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await axios.post<ApiResponse<UserDetailResponse>>(BASE_URL, form);
    return response.data;
  },

  /**
   * 3. Lấy chi tiết thông tin người dùng theo userId
   * HTTP Method: GET /api/v1/admin/users/{userId}
   */
  getUserById: async (userId: string): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await axios.get<ApiResponse<UserDetailResponse>>(`${BASE_URL}/${userId}`);
    return response.data;
  },

  /**
   * 4. Cập nhật thông tin người dùng
   * HTTP Method: PUT /api/v1/admin/users/{userId}
   */
  updateUser: async (
    userId: string,
    form: UserUpdateForm
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await axios.put<ApiResponse<UserDetailResponse>>(`${BASE_URL}/${userId}`, form);
    return response.data;
  },

  /**
   * 5. Khóa hoặc Mở khóa tài khoản người dùng
   * HTTP Method: PATCH /api/v1/admin/users/{userId}/block
   */
  blockUser: async (
    userId: string,
    form: UserBlockForm
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await axios.patch<ApiResponse<UserDetailResponse>>(
      `${BASE_URL}/${userId}/block`,
      form
    );
    return response.data;
  },

  /**
   * 6. Xóa tài khoản người dùng
   * HTTP Method: DELETE /api/v1/admin/users/{userId}
   */
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await axios.delete<ApiResponse<null>>(`${BASE_URL}/${userId}`);
    return response.data;
  },
};