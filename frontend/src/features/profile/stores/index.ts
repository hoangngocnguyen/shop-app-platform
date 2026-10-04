import { create } from "zustand";
import { userApi } from "../api";
import { UserProfileResponse, UpdateUserRequest } from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";

interface ProfileState {
    profile: UserProfileResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setProfile: (profile: UserProfileResponse | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Async Actions
    fetchProfile: () => Promise<UserProfileResponse | null>;
    updateProfile: (data: UpdateUserRequest) => Promise<UserProfileResponse | null>;
    updateAvatar: (file: File) => Promise<string | null>;
    deleteAvatar: () => Promise<void>;
    reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    profile: null,
    isLoading: false,
    error: null,

    setProfile: (profile) => set({ profile }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Lấy thông tin profile
    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const profile = await userApi.getMyProfile();
            set({ profile, isLoading: false });
            return profile;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy thông tin profile");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Cập nhật thông tin profile (chữ)
    updateProfile: async (data: UpdateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
            const updatedProfile = await userApi.updateMyProfile(data);
            set({ profile: updatedProfile, isLoading: false });
            return updatedProfile;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể cập nhật profile");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Cập nhật ảnh đại diện (Avatar)
    updateAvatar: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
            const res = await userApi.updateMyAvatar(file);
            const currentProfile = get().profile;

            if (currentProfile) {
                set({
                    profile: { ...currentProfile, avatar_url: res.avatar_url },
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }

            return res.avatar_url ?? null;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tải lên avatar");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa ảnh đại diện
    deleteAvatar: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await userApi.deleteMyAvatar();
            const currentProfile = get().profile;

            if (currentProfile) {
                set({
                    profile: { ...currentProfile, avatar_url: res.avatar_url },
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa avatar");
            set({ error: errorMessage, isLoading: false });
        }
    },

    // Reset store về trạng thái ban đầu (ví dụ khi logout)
    reset: () => set({ profile: null, isLoading: false, error: null }),
}));