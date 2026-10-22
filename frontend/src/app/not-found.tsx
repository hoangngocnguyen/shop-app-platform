import Link from 'next/link';
import { Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/**
 * File not-found.tsx chuẩn của Next.js App Router.
 * Tự động kích hoạt khi người dùng truy cập một URL không tồn tại
 * hoặc khi hàm notFound() được gọi trong mã nguồn.
 */
export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-surface-card rounded-3xl border border-surface-border p-8 shadow-brand-md text-center space-y-6">
        {/* Số 404 lớn mang phong cách Brand */}
        <div className="space-y-1">
          <h1 className="text-7xl font-extrabold tracking-tight text-primary">
            404
          </h1>
          <h2 className="text-xl font-bold text-text-main">
            Không tìm thấy trang
          </h2>
        </div>

        <p className="text-sm text-text-sub leading-relaxed">
          Đường dẫn bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>

        {/* Nút quay lại trang chủ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={ROUTES.HOME}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition shadow-brand-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
