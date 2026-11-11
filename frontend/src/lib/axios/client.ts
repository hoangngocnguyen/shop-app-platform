import axios, { AxiosError } from "axios";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import type { ApiErrorResponse } from "@/types/api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Hàm clearTokenCache giữ lại để đảm bảo tương thích ngược với các module khác.
 * Supabase Browser Client SDK (@supabase/ssr) đã tự động quản lý session in-memory atomic
 * trong singleton client, đảm bảo luôn đọc đúng token của tài khoản hiện tại ngay khi đổi tài khoản.
 */
export function clearTokenCache() {
  // no-op
}

api.interceptors.request.use(async (config) => {
  // Nếu đã chủ động truyền Authorization header (ví dụ gọi từ Server Route Handler kèm access_token)
  if (config.headers.Authorization) {
    return config;
  }

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      delete config.headers.Authorization;
    }
  } catch {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      clearTokenCache();
      if (typeof window !== "undefined") {
        await useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
