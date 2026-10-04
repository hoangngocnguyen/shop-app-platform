import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";

export interface ParsedError {
    message: string;
    errorCode: string;
    errors: Record<string, string>;
}

export const parseError = (
    err: unknown,
    fallback = "Đã xảy ra lỗi, vui lòng thử lại sau."
): ParsedError => {
    if (axios.isAxiosError<ApiErrorResponse>(err) && err.response?.data) {
        const data = err.response.data;
        return {
            message: data.message || fallback,
            errorCode: data.error_code || "BUSINESS_ERROR",
            errors: data.errors || {},
        };
    }

    if (axios.isAxiosError(err) && !err.response) {
        return {
            message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.",
            errorCode: "NETWORK_ERROR",
            errors: {},
        };
    }

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

export const parseErrorMessage = (err: unknown, fallback = "Đã xảy ra lỗi"): string => {
    return parseError(err, fallback).message;
};