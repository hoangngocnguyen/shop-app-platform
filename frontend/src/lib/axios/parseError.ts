import axios from "axios";

// ==============================================================================
// 1. DTO INTERFACES ĐỒNG BỘ HOÀN TOÀN VỚI BACKEND FASTAPI
// ==============================================================================

/**
 * Cấu trúc Response thành công tương ứng với ApiResponse[T] từ Backend
 */
export interface ApiResponse<T = unknown> {
    success: boolean; // Luôn bằng true khi API thành công
    message: string; // Thông điệp phản hồi (VD: "Thành công")
    data: T; // Dữ liệu payload thực tế kiểu T
}

/**
 * Cấu trúc Response lỗi tương ứng với ErrorResponse từ Backend
 */
export interface ApiErrorResponse {
    success: boolean; // Luôn bằng false khi có lỗi
    error_code: string; // Mã định danh lỗi (VD: "NOT_FOUND", "VALIDATION_ERROR")
    message: string; // Mô tả lỗi thân thiện
    data: null; // Luôn là null
    errors?: Record<string, string> | null; // Chi tiết lỗi theo từng field (nếu có validation)
    timestamp: number; // Thời điểm xảy ra lỗi (Epoch milliseconds)
}

/**
 * Alias tương thích ngược với code cũ (nếu có)
 */
export type ApiError = ApiErrorResponse;

// ==============================================================================
// 2. HELPER INTERFACES & PARSER FUNCTIONS
// ==============================================================================

/**
 * Kết quả sau khi trích xuất thông tin lỗi từ Axios/Unknown Error
 */
export interface ParsedError {
    message: string;
    errorCode: string;
    errors: Record<string, string>;
}

/**
 * Hàm trích xuất thông tin lỗi từ Axios Error hoặc ngoại lệ bất kỳ
 * @param err Lỗi nhận được từ catch block
 * @param fallback Message mặc định nếu không parse được
 */
export const parseError = (
    err: unknown,
    fallback = "Đã xảy ra lỗi, vui lòng thử lại sau."
): ParsedError => {
    // 1. Trường hợp lỗi AxiosResponse từ Backend trả về theo đúng chuẩn ApiErrorResponse
    if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data) {
        const data = err.response.data;

        return {
            message: data.message || fallback,
            errorCode: data.error_code || "BUSINESS_ERROR",
            errors: data.errors || {},
        };
    }

    // 2. Lỗi mạng (Network Error / CORS / Server Down)
    if (axios.isAxiosError(err) && !err.response) {
        return {
            message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.",
            errorCode: "NETWORK_ERROR",
            errors: {},
        };
    }

    // 3. Ngoại lệ JS thông thường (Error instance)
    if (err instanceof Error) {
        return {
            message: err.message || fallback,
            errorCode: "CLIENT_ERROR",
            errors: {},
        };
    }

    return {
        message: fallback,
        errorCode: "UNKNOWN_ERROR",
        errors: {},
    };
};

/**
 * Hàm rút gọn: Chỉ lấy duy nhất thông báo chuỗi (message)
 */
export const parseErrorMessage = (
    err: unknown,
    fallback = "Đã xảy ra lỗi"
): string => {
    return parseError(err, fallback).message;
};