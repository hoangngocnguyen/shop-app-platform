import { number } from './../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/src/v4/core/regexes';
import { useAuthStore } from "@/store/authStore";

// --- Error type ---
export interface ApiError {
  message: string;
  errors?: Record<string, string>; // Dùng cho lỗi validation (field -> message)
  status: number;
}


// Định nghĩa các Method
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Cấu hình các option khi gọi API
interface ApiOptions<T> {
  method?: HttpMethod;
  data?: T;
  headers?: Record<string, string>;
}

const BASE_URL = 'http://localhost:8080/api';

// --- QUẢN LÝ KHÓA TRÙNG LẶP REFRESH (Giữ lại để tránh spam request refresh) ---
let refreshTokenPromise: Promise<boolean> | null = null;

const readJson = async <R>(response: Response): Promise<R | null> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    return null;
  }

  try {
    // Clone response để tránh lỗi "body stream already read" nếu cần dùng lại response ở nơi khác
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();

    // Kiểm tra nếu body rỗng thì không parse để tránh SyntaxError
    if (!text || text.trim() === "") {
      return null;
    }

    return JSON.parse(text) as R;
  } catch (error) {
    // Log nhẹ lỗi parse nếu cần debug, và trả về null thay vì làm sập app
    console.error("Failed to parse JSON response:", error);
    return null;
  }
};

const createApiError = async (response: Response): Promise<ApiError> => {
  const result = await readJson<{ message?: string; errors?: Record<string, string>; }>(response);

  return {
    message: result?.message || "Đã có lỗi xảy ra từ phía Server",
    status: response.status,
    errors: result?.errors || {},
  };
};

// --- HÀM REFRESH TOKEN ---
// Trình duyệt tự gửi RT trong cookie, Backend tự set lại AT mới vào Cookie
export const handleRefreshToken = async (): Promise<boolean> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = refreshAccessToken();

  try {
    return await refreshTokenPromise;
  } finally {
    refreshTokenPromise = null;
  }
}

const refreshAccessToken = async (): Promise<boolean> => {
  const setStatus = useAuthStore.getState().setStatus;
  try {
    const response = await fetch(`${BASE_URL}/auth/refreshtoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Bắt buộc để trình duyệt gửi/nhận cookie
    });

    if (!response.ok) throw new Error("Refresh token expired or invalid");

    // Vì Backend tự ghi AT mới vào Cookie qua 'Set-Cookie', FE chỉ cần trả về true xác nhận thành công
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);

    // refresh token hết hạn, không có trong cookie, hoặc lỗi khác. Chuyển trạng thái user sang UNAUTHENTICATED
    setStatus("UNAUTHENTICATED");
    return false;
  }
}


// --- HÀM GỌI API CHÍNH ---
export const api = async <T, R>(
  endpoint: string,
  options: ApiOptions<T>,
): Promise<R> => {
  const { method = 'POST', data, headers: customHeaders } = options;

  // 1. Cấu hình Header
  const headers: Record<string, string> = {
    ...customHeaders,
  };
  const isFormData = data instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // 2. Cấu hình Request
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // QUAN TRỌNG: Để trình duyệt TỰ ĐỘNG gửi kèm Cookie (AT/RT) có sẵn
  };

  // Không ép stringify (trường hợp gửi FormData)
  if (data && method !== "GET" && method !== "DELETE") {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  // 3. Gọi fetch
  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 4. REFRESH TOKEN: Xử lý khi Access Token bị hết hạn (Backend trả về 401 Unauthorized)
  if (response.status === 401 && endpoint !== '/auth/refreshtoken' && endpoint !== '/auth/login') {

    const isRefreshed = await handleRefreshToken();

    if (!isRefreshed) {
      throw await createApiError(response);
    }

    // Thử gọi lại API cũ lần nữa. Lúc này Cookie mới đã được cập nhật tự động trong trình duyệt
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  }

  if (!response.ok) {
    throw await createApiError(response);
  }

  const result = await readJson<R>(response);
  return result as R;
};
