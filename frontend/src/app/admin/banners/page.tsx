"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminBannerHeader } from "@/features/banners/components/admin/AdminBannerHeader";
import { AdminBannerList } from "@/features/banners/components/admin/AdminBannerList";
import { BannerPreviewModal } from "@/features/banners/components/admin/BannerPreviewModal";
import { BannerFormModal } from "@/features/banners/components/BannerFormModal";
import {
  deleteBanner,
  fetchAdminBanners,
  toggleBannerActive,
} from "@/features/banners/api";
import { AdminBanner, BannerPosition } from "@/features/banners/types";

const PAGE_SIZE = 15;
const PREVIEW_PAGE_SIZE = 100;

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState("");
  const [isActive, setIsActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBanners, setPreviewBanners] = useState<AdminBanner[]>([]);
  const [previewPosition, setPreviewPosition] = useState<BannerPosition | "">("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);
  const running = useMemo(
    () => banners.filter((banner) => banner.is_active).length,
    [banners]
  );
  const disabled = banners.filter((banner) => !banner.is_active).length;

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAdminBanners(page, PAGE_SIZE, position, isActive);
      setBanners(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  }, [isActive, page, position]);

  useEffect(() => {
    let cancelled = false;
    fetchAdminBanners(page, PAGE_SIZE, position, isActive)
      .then((response) => {
        if (cancelled) return;
        setBanners(response.items);
        setTotal(response.total);
        setError("");
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách banner");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isActive, page, position]);

  const openPreview = useCallback(async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewBanners([]);
    setPreviewIndex(0);
    try {
      const firstPage = await fetchAdminBanners(
        1,
        PREVIEW_PAGE_SIZE,
        "",
        isActive
      );
      const allBanners = [...firstPage.items];
      const pages = Math.ceil(firstPage.total / PREVIEW_PAGE_SIZE);
      for (let currentPage = 2; currentPage <= pages; currentPage += 1) {
        const response = await fetchAdminBanners(
          currentPage,
          PREVIEW_PAGE_SIZE,
          "",
          isActive
        );
        allBanners.push(...response.items);
      }
      setPreviewBanners(allBanners);
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Không thể tải các banner để xem trước"
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [isActive]);

  const openCreateForm = () => {
    setEditingBanner(null);
    setFormOpen(true);
  };

  const openEditForm = (banner: AdminBanner) => {
    setEditingBanner(banner);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingBanner(null);
    void loadBanners();
  };

  const handleToggle = async (banner: AdminBanner) => {
    setLoading(true);
    setError("");
    try {
      await toggleBannerActive(banner.id, !banner.is_active);
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi trạng thái banner");
      setLoading(false);
    }
  };

  const handleDelete = async (banner: AdminBanner) => {
    if (!window.confirm(`Bạn có chắc muốn xóa banner "${banner.title}"?`)) return;
    setLoading(true);
    setError("");
    try {
      await deleteBanner(banner.id);
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa banner");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto px-4 pt-2 pb-8 md:pt-3 md:pb-10 space-y-6">
      <AdminBannerHeader
        total={total}
        running={running}
        disabled={disabled}
        onCreate={openCreateForm}
        onPreview={() => void openPreview()}
      />

      <AdminBannerList
        banners={banners}
        total={total}
        firstItem={firstItem}
        lastItem={lastItem}
        page={page}
        totalPages={totalPages}
        position={position}
        isActive={isActive}
        loading={loading}
        error={error}
        onPositionChange={(value) => {
          setLoading(true);
          setPage(1);
          setPosition(value);
        }}
        onActiveChange={(value) => {
          setLoading(true);
          setPage(1);
          setIsActive(value);
        }}
        onRefresh={() => void loadBanners()}
        onRetry={() => void loadBanners()}
        onPageChange={(value) => {
          setLoading(true);
          setPage(value);
        }}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onToggle={(banner) => void handleToggle(banner)}
        onDelete={(banner) => void handleDelete(banner)}
      />

      {formOpen && (
        <BannerFormModal
          editingBanner={editingBanner}
          onClose={() => {
            setFormOpen(false);
            setEditingBanner(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {previewOpen && (
        <BannerPreviewModal
          banners={previewBanners}
          position={previewPosition}
          index={previewIndex}
          device={previewDevice}
          loading={previewLoading}
          error={previewError}
          onClose={() => setPreviewOpen(false)}
          onRetry={() => void openPreview()}
          onIndexChange={setPreviewIndex}
          onPositionChange={(value) => {
            setPreviewPosition(value);
            setPreviewIndex(0);
          }}
          onDeviceChange={setPreviewDevice}
        />
      )}
    </main>
  );
}
