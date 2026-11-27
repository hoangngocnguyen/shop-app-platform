export type BannerPosition =
  | "home_hero"
  | "home_banner_grid"
  | "category_top"
  | "popup";

export const POSITION_LABELS: Record<BannerPosition, string> = {
  home_hero: "Slider Trang chủ (home_hero)",
  home_banner_grid: "Lưới Banner Trang chủ (home_banner_grid)",
  category_top: "Đầu trang Danh mục (category_top)",
  popup: "Popup Khuyến mãi (popup)",
};

export interface PublicBanner {
  id: number;
  title: string;
  image_url: string;
  mobile_image_url: string;
  link_url: string | null;
  alt_text: string;
  position: BannerPosition;
}

export interface AdminBanner {
  id: number;
  title: string;
  image_url: string;
  image_public_id: string | null;
  mobile_image_url: string | null;
  mobile_image_public_id: string | null;
  alt_text: string | null;
  link_url: string | null;
  position: BannerPosition;
  priority: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BannerFormData = Omit<
  AdminBanner,
  "id" | "created_at" | "updated_at" | "image_public_id"
> & {
  image_public_id: string;
};

export type BannerUpdateData = Omit<
  BannerFormData,
  "image_url" | "image_public_id"
> &
  Partial<Pick<BannerFormData, "image_url" | "image_public_id">>;

export interface BannerListResponse {
  items: AdminBanner[];
  total: number;
  page: number;
  limit: number;
}

export function getBannerStatus(banner: AdminBanner) {
  if (!banner.is_active) {
    return { label: "Đã tắt", color: "bg-surface-hover text-text-sub" };
  }

  const now = Date.now();
  if (banner.start_time && now < new Date(banner.start_time).getTime()) {
    return {
      label: "Chưa đến giờ",
      color: "bg-status-warning-bg text-status-warning",
    };
  }
  if (banner.end_time && now > new Date(banner.end_time).getTime()) {
    return { label: "Hết hạn", color: "bg-status-error-bg text-status-error" };
  }

  return { label: "Đang chạy", color: "bg-status-success-bg text-status-success" };
}