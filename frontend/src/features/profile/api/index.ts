import api from "@/lib/axios/client";
import {
    UserProfileResponse,
    UpdateUserRequest,
    AvatarResponse
} from "../types";

export const userApi = {
    /**
     * Lấy thông tin profile của người dùng đang đăng nhập dựa trên token.
     * GET /users/me
     */
    getMyProfile: async (): Promise<UserProfileResponse> => {
        const response = await api.get<UserProfileResponse>("/users/me");
        return response.data;
    },

    /**
     * Cập nhật một hoặc nhiều thông tin cá nhân (ngoại trừ avatar).
     * PATCH /users/me
     */
    updateMyProfile: async (data: UpdateUserRequest): Promise<UserProfileResponse> => {
        const response = await api.patch<UserProfileResponse>("/users/me", data);
        return response.data;
    },

    /**
     * Tải file ảnh đại diện mới lên và cập nhật avatar_url.
     * PATCH /users/me/avatar (Gửi dạng multipart/form-data)
     */
    updateMyAvatar: async (file: File): Promise<AvatarResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.patch<AvatarResponse>("/users/me/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Xóa ảnh đại diện hiện tại của người dùng.
     * DELETE /users/me/avatar
     */
    deleteMyAvatar: async (): Promise<AvatarResponse> => {
        const response = await api.delete<AvatarResponse>("/users/me/avatar");
        return response.data;
    },
};