'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Shop App Platform
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-300 hover:text-white font-medium transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-300 hover:text-white font-medium transition px-3 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-600/20"
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-3xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            ⚡ Nền tảng bán hàng thế hệ mới
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Quản lý và phát triển cửa hàng của bạn một cách{' '}
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              thông minh
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Giải pháp toàn diện hỗ trợ quản lý sản phẩm, đơn hàng và khách hàng tối ưu nhất cho doanh nghiệp vừa và nhỏ.
          </p>

          {isAuthenticated() ? (
            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="text-slate-300 text-sm bg-slate-900/80 border border-slate-800 rounded-xl px-5 py-3">
                Xin chào trở lại, <span className="font-semibold text-indigo-400">{user?.email}</span>!
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-xl shadow-indigo-600/25 gap-2"
              >
                Vào Trang Quản Lý (Dashboard) &rarr;
              </Link>
            </div>
          ) : (
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-xl shadow-indigo-600/25"
              >
                Bắt đầu ngay miễn phí
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold transition"
              >
                Đăng nhập tài khoản
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Shop App Platform. Built with Next.js & Supabase.
      </footer>
    </div>
  );
}