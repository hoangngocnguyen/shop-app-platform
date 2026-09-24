'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200/80 backdrop-blur-md bg-white/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shop App Platform
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition shadow-xs"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium transition px-3 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="text-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition shadow-md shadow-indigo-600/15"
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
        {/* Background glow effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 text-indigo-700 text-xs font-semibold tracking-wide shadow-xs">
            ⚡ Nền tảng bán hàng thế hệ mới
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Quản lý và phát triển cửa hàng của bạn một cách{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              thông minh
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Giải pháp toàn diện hỗ trợ quản lý sản phẩm, đơn hàng và khách hàng tối ưu nhất cho doanh nghiệp vừa và nhỏ.
          </p>

          {isAuthenticated() ? (
            <div className="pt-2 flex flex-col items-center gap-4">
              <div className="text-slate-700 text-sm bg-white/90 border border-slate-200 shadow-xs rounded-xl px-5 py-3">
                Xin chào trở lại, <span className="font-semibold text-indigo-600">{user?.email}</span>!
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-lg shadow-indigo-600/20 gap-2"
              >
                Vào Trang Quản Lý (Dashboard) &rarr;
              </Link>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-lg shadow-indigo-600/20"
              >
                Bắt đầu ngay miễn phí
              </Link>
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="px-6 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition shadow-xs"
              >
                Đăng nhập tài khoản
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Shop App Platform. Built with Next.js & Supabase.
      </footer>
    </div>
  );
}