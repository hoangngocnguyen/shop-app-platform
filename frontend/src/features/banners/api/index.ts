import {
  AdminBanner,
  BannerFormData,
  BannerListResponse,
  BannerPosition,
  PublicBanner,
} from "../types";
import { createClient } from "@/lib/supabase/client";

// Lưu ý: dùng localhost:8000 cho khớp với localhost:3000 nếu dự án xác thực bằng Cookie
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const { data: { session }, error } = await createClient().auth.getSession();
  if (error) throw error;
  const token = session?.access_token;
  if (!token) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. Lấy banner hiển thị ngoài trang khách hàng (Public - không cần auth)
export async function fetchPublicBanners(
  position: BannerPosition
): Promise<PublicBanner[]> {
  const res = await fetch(`${BASE_URL}/banners?position=${position}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Không thể tải banner (${res.status})`);
  }
  return await res.json();
}

// 2. Upload ảnh lên Cloudinary
export async function uploadBannerFile(
  file: File
): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/media/upload`, {
    method: "POST",
    headers: await getAuthHeader(),
    credentials: "include",
    body: formData,
  });

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const errorBody =
      typeof body === "object" && body !== null ? body : null;
    const message =
      errorBody && "message" in errorBody && typeof errorBody.message === "string"
        ? errorBody.message
        : errorBody && "detail" in errorBody && typeof errorBody.detail === "string"
          ? errorBody.detail
          : `Upload ảnh thất bại (${res.status})`;
    throw new Error(message);
  }

  const responseBody =
    typeof body === "object" && body !== null && "data" in body
      ? body.data
      : null;
  const uploadedImage =
    typeof responseBody === "object" && responseBody !== null
      ? responseBody
      : null;
  if (
    !uploadedImage ||
    !("url" in uploadedImage) ||
    !("public_id" in uploadedImage) ||
    typeof uploadedImage.url !== "string" ||
    typeof uploadedImage.public_id !== "string"
  ) {
    throw new Error("Phản hồi upload ảnh không hợp lệ. Vui lòng thử lại.");
  }

  return {
    url: uploadedImage.url,
    public_id: uploadedImage.public_id,
  };
}

// 3. Lấy danh sách banner trong Admin
export async function fetchAdminBanners(
  page: number,
  limit: number,
  position: string,
  isActive: string
): Promise<BannerListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (position) params.set("position", position);
  if (isActive) params.set("is_active", isActive);

  const res = await fetch(`${BASE_URL}/admin/banners?${params.toString()}`, {
    headers: await getAuthHeader(),
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Không thể tải danh sách banner");
  return await res.json();
}

// 4. Tạo mới banner
export async function createBanner(data: BannerFormData): Promise<AdminBanner> {
  const res = await fetch(`${BASE_URL}/admin/banners`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Tạo banner thất bại");
  }
  return await res.json();
}

// 5. Cập nhật banner
export async function updateBanner(
  id: number,
  data: BannerFormData
): Promise<AdminBanner> {
  const res = await fetch(`${BASE_URL}/admin/banners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Cập nhật banner thất bại");
  }
  return await res.json();
}

// 6. Bật / tắt nhanh trạng thái
export async function toggleBannerActive(
  id: number,
  is_active: boolean
): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/banners/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
    credentials: "include",
    body: JSON.stringify({ is_active }),
  });
  if (!res.ok) throw new Error("Đổi trạng thái thất bại");
}

// 7. Xóa banner
export async function deleteBanner(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/admin/banners/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Xóa banner thất bại");
}