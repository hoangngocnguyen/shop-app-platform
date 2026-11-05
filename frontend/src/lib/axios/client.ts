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

// Cache access token trong memory để tránh gọi supabase.auth.getSession() lặp đi lặp lại
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0; // Epoch timestamp tính theo giây

export function clearTokenCache() {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
}

api.interceptors.request.use(async (config) => {
  const now = Math.floor(Date.now() / 1000);

  // Nếu token còn hạn ít nhất 30 giây nữa, tái sử dụng token ngay lập tức (0ms overhead)
  if (cachedAccessToken && tokenExpiresAt > now + 30) {
    config.headers.Authorization = `Bearer ${cachedAccessToken}`;
    return config;
  }

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      cachedAccessToken = session.access_token;
      tokenExpiresAt = session.expires_at ?? (now + 3600);
      config.headers.Authorization = `Bearer ${cachedAccessToken}`;
    } else {
      cachedAccessToken = null;
      tokenExpiresAt = 0;
      delete config.headers.Authorization;
    }
  } catch {
    cachedAccessToken = null;
    tokenExpiresAt = 0;
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      clearTokenCache();
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
