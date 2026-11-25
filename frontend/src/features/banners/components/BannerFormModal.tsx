"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import {
  AdminBanner,
  BannerFormData,
  BannerPosition,
  POSITION_LABELS,
} from "@/features/banners/types";
import {
  createBanner,
  updateBanner,
  uploadBannerFile,
} from "@/features/banners/api";

const inputClassName =
  "h-11 w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10";

function trimValue(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const localTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
}

interface Props {
  editingBanner: AdminBanner | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BannerFormModal({ editingBanner, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(editingBanner?.title ?? "");
  const [imageUrl, setImageUrl] = useState(editingBanner?.image_url ?? "");
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    editingBanner?.image_public_id ?? null
  );
  const [altText, setAltText] = useState(editingBanner?.alt_text ?? "");
  const [linkUrl, setLinkUrl] = useState(editingBanner?.link_url ?? "");
  const [position, setPosition] = useState<BannerPosition>(
    editingBanner?.position ?? "home_hero"
  );
  const [priority, setPriority] = useState(editingBanner?.priority ?? 0);
  const [startTime, setStartTime] = useState(
    toLocalInput(editingBanner?.start_time ?? null)
  );
  const [endTime, setEndTime] = useState(
    toLocalInput(editingBanner?.end_time ?? null)
  );
  const [isActive, setIsActive] = useState(editingBanner?.is_active ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const res = await uploadBannerFile(file);
      setImageUrl(res.url);
      setImagePublicId(res.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = trimValue(title);
    const cleanImageUrl = trimValue(imageUrl);
    const cleanAltText = trimValue(altText);
    const cleanLink = trimValue(linkUrl);
    const parsedStartTime = startTime ? new Date(startTime) : null;
    const parsedEndTime = endTime ? new Date(endTime) : null;

    if (!cleanTitle) return setError("Tiêu đề không được để trống");
    if (!cleanImageUrl) return setError("Vui lòng chọn ảnh Desktop");
    const isInternalLink =
      cleanLink.startsWith("/") && !cleanLink.startsWith("//") && !cleanLink.startsWith("/\\");
    if (cleanLink && !isInternalLink && !cleanLink.startsWith("https://")) {
      return setError("Link chỉ được bắt đầu bằng '/' hoặc 'https://'");
    }
    if (priority < 0 || priority > 9999) {
      return setError("Độ ưu tiên phải từ 0 đến 9999");
    }
    if (parsedStartTime && Number.isNaN(parsedStartTime.getTime())) {
      return setError("Thời gian bắt đầu không hợp lệ");
    }
    if (parsedEndTime && Number.isNaN(parsedEndTime.getTime())) {
      return setError("Thời gian kết thúc không hợp lệ");
    }
    if (
      parsedStartTime &&
      parsedEndTime &&
      parsedEndTime <= parsedStartTime
    ) {
      return setError("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
    }
    if (editingBanner && !window.confirm("Xác nhận cập nhật banner này?")) {
      return;
    }

    const payload: BannerFormData = {
      title: cleanTitle,
      image_url: cleanImageUrl,
      image_public_id: imagePublicId,
      mobile_image_url: editingBanner?.mobile_image_url ?? null,
      mobile_image_public_id: editingBanner?.mobile_image_public_id ?? null,
      alt_text: cleanAltText || cleanTitle,
      link_url: cleanLink || null,
      position,
      priority: Number(priority),
      start_time: parsedStartTime?.toISOString() ?? null,
      end_time: parsedEndTime?.toISOString() ?? null,
      is_active: isActive,
    };

    setSaving(true);
    setError("");
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload);
      } else {
        await createBanner(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-form-title"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-surface-card shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-center justify-between gap-4 border-b border-surface-border bg-gradient-to-r from-primary-light/80 via-white to-white px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 id="banner-form-title" className="truncate text-lg font-bold text-text-main">
              {editingBanner ? `Chỉnh sửa Banner #${editingBanner.id}` : "Tạo Banner mới"}
            </h2>
            <div>
              <p className="text-xs text-text-muted">
                Thiết lập hình ảnh, vị trí và thời gian hiển thị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-xl border border-transparent p-2.5 text-text-muted transition hover:border-surface-border hover:bg-white hover:text-text-main"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto bg-surface-bg/50 px-5 py-5 sm:px-7 sm:py-6">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-status-error/20 bg-status-error-bg px-4 py-3 text-sm text-status-error">
                <span className="font-semibold">Có lỗi:</span>
                <span>{error}</span>
              </div>
            )}

            <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-xs sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-text-main">Thông tin cơ bản</h3>
                <p className="mt-1 text-xs text-text-muted">Đặt tên và chọn nơi banner xuất hiện</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="banner-title" className="mb-1.5 block text-xs font-semibold text-text-sub">Tiêu đề <span className="text-status-error">*</span></label>
                  <input
                    id="banner-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Khuyến mãi mùa hè"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="banner-position" className="mb-1.5 block text-xs font-semibold text-text-sub">Vị trí hiển thị <span className="text-status-error">*</span></label>
                  <select
                    id="banner-position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value as BannerPosition)}
                    className={inputClassName}
                  >
                    {Object.entries(POSITION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-text-main">Hình ảnh banner</h3>
                <p className="mt-1 text-xs text-text-muted">Một ảnh duy nhất sẽ tự co theo kích thước màn hình Desktop và Mobile</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-text-main">Ảnh banner <span className="ml-1 text-status-error">*</span></p>
                    <p className="text-[10px] text-text-muted">Dùng cùng một ảnh trên mọi thiết bị</p>
                  </div>
                </div>
                <div className="space-y-3 p-3 sm:p-4">
                  <label className={`group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/25 bg-primary-light/40 px-3 py-3 text-xs font-semibold text-primary transition hover:border-primary/50 hover:bg-primary-light/70 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                    {uploading ? "Đang tải ảnh lên..." : "Chọn ảnh từ thiết bị"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUpload(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <input
                    aria-label="URL ảnh banner"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán URL ảnh banner"
                    className="h-10 w-full rounded-lg border border-surface-border bg-white px-3 text-xs text-text-main outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-surface-border bg-gradient-to-br from-slate-100 to-slate-200">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Xem trước ảnh banner"
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] text-text-muted">
                        Bản xem trước sẽ hiển thị tại đây
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-xs sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-text-main">Điều hướng & tối ưu</h3>
                <p className="mt-1 text-xs text-text-muted">Thiết lập liên kết và nội dung hỗ trợ tìm kiếm</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label htmlFor="banner-link" className="mb-1.5 block text-xs font-semibold text-text-sub">Link điều hướng</label>
                  <input id="banner-link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/products hoặc https://" className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="banner-priority" className="mb-1.5 block text-xs font-semibold text-text-sub">Độ ưu tiên <span className="font-normal text-text-muted">(0–9999)</span></label>
                  <input id="banner-priority" type="number" min={0} max={9999} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className={inputClassName} />
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="banner-alt" className="mb-1.5 block text-xs font-semibold text-text-sub">Mô tả ảnh (Alt text)</label>
                  <input id="banner-alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Mô tả ngắn gọn nội dung hình ảnh" className={inputClassName} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-surface-border bg-white p-4 shadow-xs sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-text-main">Lịch hiển thị</h3>
                <p className="mt-1 text-xs text-text-muted">Để trống thời gian kết thúc nếu banner không giới hạn</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="banner-start" className="mb-1.5 block text-xs font-semibold text-text-sub">Bắt đầu hiển thị</label>
                  <input id="banner-start" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="banner-end" className="mb-1.5 block text-xs font-semibold text-text-sub">Kết thúc hiển thị</label>
                  <input id="banner-end" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClassName} />
                </div>
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary-light/40 px-4 py-3 transition hover:bg-primary-light/70">
                <span>
                  <span className="block text-xs font-semibold text-text-main">Kích hoạt banner</span>
                  <span className="mt-0.5 block text-[11px] text-text-muted">Cho phép banner được hiển thị khi đến thời gian đã đặt</span>
                </span>
                <span className="relative inline-flex shrink-0">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer sr-only" />
                  <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20" />
                  <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
              </label>
            </section>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-surface-border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="hidden text-xs text-text-muted sm:block">
              <span className="text-status-error">*</span> Trường bắt buộc
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-surface-border px-5 text-sm font-semibold text-text-sub transition hover:bg-surface-hover"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-primary-contrast shadow-brand-sm transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Đang tải ảnh..." : saving ? "Đang lưu..." : editingBanner ? "Lưu thay đổi" : "Tạo Banner"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}