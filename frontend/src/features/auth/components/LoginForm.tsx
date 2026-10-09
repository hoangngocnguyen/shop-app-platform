'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const sync = useAuthStore((state) => state.sync);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      const user = await sync();
      if (!user) {
        await supabase.auth.signOut();
        setErrorMsg('Đăng nhập thành công nhưng không thể đồng bộ tài khoản. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
      setLoading(false);

      setTimeout(() => {
        router.replace(ROUTES.USER.PROFILE);
        router.refresh();
      }, 800);
    } catch (submitError) {
      setErrorMsg(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-6 shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl sm:p-8">
      
      {/* ===== HIỆU ỨNG NỔI BỌT / BONG BÓNG TRONG SUỐT (FLOATING BUBBLES) ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
        {/* Bong bóng 1 - Góc trên bên trái */}
        <div className="absolute -left-4 -top-4 h-24 w-24 animate-pulse rounded-full bg-primary/10 blur-xl transition-all duration-1000 group-hover:scale-125" />
        
        {/* Bong bóng 2 - Góc dưới bên phải */}
        <div className="absolute -bottom-8 -right-8 h-32 w-32 animate-pulse rounded-full bg-accent/15 blur-2xl transition-all duration-1000 group-hover:scale-110 [animation-delay:1s]" />

        {/* Bong bóng nổi nhẹ ở trung tâm */}
        <div className="absolute left-1/2 top-1/3 h-16 w-16 -translate-x-1/2 animate-bounce rounded-full bg-primary-light/10 blur-lg [animation-duration:4s]" />
      </div>

      {/* Header & Logo Đăng Nhập */}
      <div className="relative mb-8 text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          {/* Vòng hào quang xoay mượt phía sau */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary via-primary-light to-accent opacity-60 blur-sm animate-spin [animation-duration:8s]" />

          {/* Sóng phát sáng nhịp nhàng */}
          <div className="absolute inset-1 rounded-2xl bg-primary/15 animate-ping [animation-duration:3s]" />

          {/* Icon chính với hiệu ứng xoay 3D & nổi màu khi Hover */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-border bg-surface-card text-primary shadow-md transition-all duration-500 hover:scale-110 hover:-rotate-6 hover:bg-primary hover:text-primary-contrast hover:shadow-xl hover:shadow-primary/25">
            <svg
              className="h-8 w-8 transition-transform duration-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-text-main">
          Chào mừng trở lại!
        </h2>
        <p className="mt-1.5 text-sm text-text-sub">
          Đăng nhập vào tài khoản của bạn để tiếp tục
        </p>
      </div>

      {/* Thông báo Lỗi */}
      {errorMsg && (
        <div
          role="alert"
          className="relative mb-6 flex items-center gap-3 rounded-xl border border-status-error/20 bg-status-error-bg p-3.5 text-xs font-medium text-status-error transition-all duration-300 animate-in fade-in slide-in-from-top-2"
        >
          <svg className="h-5 w-5 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thông báo Thành công */}
      {successMsg && (
        <div
          role="status"
          className="relative mb-6 flex items-center gap-3 rounded-xl border border-status-success/20 bg-status-success-bg p-4 text-xs font-semibold text-status-success transition-all duration-300 animate-in fade-in slide-in-from-top-2"
        >
          <svg className="h-5 w-5 shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Đăng Nhập */}
      <form onSubmit={handleLogin} className="relative space-y-5">
        {/* Email Input */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-semibold text-text-main"
          >
            Địa chỉ Email
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              disabled={loading || Boolean(successMsg)}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-surface-border bg-surface-bg/70 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm backdrop-blur-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-md focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Mật Khẩu Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-text-main"
            >
              Mật khẩu
            </label>
            <a
              href="#forgot-password"
              className="text-xs font-medium text-accent transition-all duration-200 hover:-translate-y-0.5 hover:text-accent-hover hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              disabled={loading || Boolean(successMsg)}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-surface-border bg-surface-bg/70 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm backdrop-blur-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-md focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition-all duration-200 hover:scale-110 hover:text-text-main"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 013.682-.813c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Nút Submit Main */}
        <button
          type="submit"
          disabled={loading || Boolean(successMsg)}
          className="relative w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-contrast shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin text-primary-contrast" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            <span>Đăng nhập</span>
          )}
        </button>
      </form>

      {/* Đường phân cách */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-border" />
        </div>
        <span className="relative bg-surface-card px-3 text-xs uppercase tracking-wider text-text-sub">
          Hoặc
        </span>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || Boolean(successMsg)}
        className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-surface-bg/70 py-3 text-sm font-semibold text-text-main shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-card hover:shadow-md active:translate-y-0 disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Đăng nhập với Google
      </button>

      {/* Footer Link */}
      <p className="relative mt-8 text-center text-xs text-text-sub">
        Chưa có tài khoản?{' '}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="inline-block font-semibold text-accent transition-all duration-200 hover:-translate-y-0.5 hover:text-accent-hover hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}