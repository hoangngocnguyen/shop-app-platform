'use client';

import Link from 'next/link';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    window.location.href = ROUTES.AUTH.LOGIN;
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col justify-between selection:bg-primary selection:text-primary-contrast">
      {/* Navigation Bar */}
      <header className="border-b border-surface-border/80 backdrop-blur-md bg-surface-card/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-primary font-extrabold">
              Shop App Platform
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-bg text-text-sub font-medium transition shadow-brand-sm cursor-pointer"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="text-sm text-text-sub hover:text-text-main font-medium transition px-3 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="text-sm px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast font-medium transition shadow-brand-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-6 py-20">
        {/* Glow effect ăn theo tông primary-light */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-light rounded-full blur-[120px] pointer-events-none opacity-60" />

        <div className="max-w-3xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-surface-border bg-primary-light text-primary text-xs font-semibold tracking-wide shadow-brand-sm">
            ⚡ Nền tảng bán hàng thế hệ mới
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-main leading-tight">
            Quản lý và phát triển cửa hàng của bạn một cách{' '}
            <span className="text-primary">
              thông minh
            </span>
          </h1>

          <p className="text-lg text-text-sub max-w-2xl mx-auto leading-relaxed">
            Giải pháp toàn diện hỗ trợ quản lý sản phẩm, đơn hàng và khách hàng tối ưu nhất cho doanh nghiệp vừa và nhỏ.
          </p>

          {isAuthenticated() ? (
            <div className="pt-2 flex flex-col items-center gap-4">
              <div className="text-text-sub text-sm bg-surface-card border border-surface-border shadow-brand-sm rounded-xl px-5 py-3">
                Xin chào trở lại, <span className="font-semibold text-primary">{user?.email}</span>!
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast font-semibold transition shadow-brand-md gap-2"
              >
                Vào Trang Quản Lý (Dashboard) &rarr;
              </Link>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast font-semibold transition shadow-brand-md"
              >
                Bắt đầu ngay miễn phí
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="px-6 py-3.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-bg text-text-main font-semibold transition shadow-brand-sm"
              >
                Đăng nhập tài khoản
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface-card py-6 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} Shop App Platform. Built with Next.js & Supabase.
      </footer>
    </div>
  );
}