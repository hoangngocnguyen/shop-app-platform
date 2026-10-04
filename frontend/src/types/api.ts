/**
 * DTO cho Response thành công từ Backend FastAPI (ApiResponse[T])
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * DTO cho Response lỗi từ Backend FastAPI (ErrorResponse)
 */
export interface ApiErrorResponse {
    success: boolean;
    error_code: string;
    message: string;
    data: null;
    errors?: Record<string, string> | null;
    timestamp: number;
}

export type ApiError = ApiErrorResponse;