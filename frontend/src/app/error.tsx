'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/**
 * File error.tsx chuẩn của Next.js App Router (Bắt buộc phải là Client Component).
 * Hoạt động như một React Error Boundary tự động:
 * Bắt tất cả các lỗi runtime phát sinh trong cây component con,
 * ngăn không cho toàn bộ trang bị sập, và cung cấp nút "Thử lại" (reset).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log lỗi để theo dõi và debug
    console.error('Next.js Error Boundary phát hiện lỗi:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-surface-card rounded-3xl border border-surface-border p-8 shadow-brand-md text-center space-y-6">
        {/* Icon cảnh báo */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-status-error-bg text-status-error flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* Tiêu đề & Thông báo */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-main">
            Đã xảy ra sự cố!
          </h2>
          <p className="text-xs text-text-sub leading-relaxed">
            Hệ thống không thể tải dữ liệu vào lúc này. Vui lòng bấm thử lại hoặc quay về trang chủ.
          </p>
          {error?.message && (
            <p className="text-[11px] font-mono text-status-error bg-status-error-bg/60 p-2.5 rounded-xl break-words">
              {error.message}
            </p>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition shadow-brand-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </button>
          <Link
            href={ROUTES.HOME}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-surface-border text-text-sub hover:bg-surface-hover text-sm font-medium transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
