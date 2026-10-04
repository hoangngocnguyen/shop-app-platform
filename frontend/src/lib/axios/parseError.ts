import axios from "axios";

// 1. Định nghĩa Type cho API Error tương ứng với response từ backend
export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string> | null;
    timestamp: number;
}

// 2. Logic xử lý hiện tại chỉ lấy message, fall back nếu không có message
export const parseError = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError<ApiError>(err)) {
        return err.response?.data?.message || fallback;
    }
    return fallback;
};