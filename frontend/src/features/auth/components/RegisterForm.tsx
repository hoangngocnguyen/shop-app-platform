'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const sync = useAuthStore((state) => state.sync);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (!data.session) {
        setSuccessMsg('Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.');
        return;
      }

      const user = await sync();
      if (!user) {
        await supabase.auth.signOut();
        setErrorMsg('Đăng ký thành công nhưng không thể đồng bộ tài khoản. Vui lòng thử đăng nhập lại.');
        return;
      }

      router.replace(ROUTES.USER.PROFILE);
      router.refresh();
    } catch (submitError) {
      setErrorMsg(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể tạo tài khoản. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative w-full rounded-3xl border border-surface-border bg-surface-card p-6 shadow-xl transition-all duration-300 hover:border-primary/30 hover:shadow-2xl sm:p-8">
      
      {/* Header & Logo Đăng Ký Chuyển Động Sang Trọng */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          {/* Vòng hào quang xoay mượt mà đệm phía sau */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary via-primary-light to-accent opacity-70 blur-sm animate-spin [animation-duration:6s]" />

          {/* Sóng phát sáng nhịp nhàng */}
          <div className="absolute inset-1 rounded-2xl bg-primary/20 animate-ping [animation-duration:3s]" />

          {/* Icon chính với hiệu ứng xoay 3D nổi bật khi rê chuột */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-card text-primary shadow-md transition-all duration-500 hover:scale-110 hover:-rotate-6 hover:bg-primary hover:text-primary-contrast hover:shadow-xl hover:shadow-primary/30">
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
                d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-8 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm10 0v6m3-3h-6"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-text-main">
          Tạo tài khoản
        </h2>
        <p className="mt-1.5 text-sm text-text-sub">
          Đăng ký để bắt đầu trải nghiệm HoangShop
        </p>
      </div>

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-status-error/20 bg-status-error-bg p-3.5 text-xs font-medium text-status-error transition-all duration-300 animate-in fade-in slide-in-from-top-2"
        >
          <svg className="h-5 w-5 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thông báo thành công */}
      {successMsg && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-status-success/20 bg-status-success-bg p-4 text-xs font-semibold text-status-success transition-all duration-300 animate-in fade-in slide-in-from-top-2"
        >
          <svg className="h-5 w-5 shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            {successMsg}{' '}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-bold underline underline-offset-2 transition-colors hover:text-primary-hover"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      )}

      {/* Form Đăng Ký */}
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Email Input - Hiệu ứng Nổi khi Hover & Focus */}
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-xs font-semibold text-text-main"
          >
            Địa chỉ Email
          </label>
          <div className="relative">
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              disabled={loading || Boolean(successMsg)}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-surface-border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-md focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Mật Khẩu Input - Hiệu ứng Nổi & Nút Ẩn/Hiện */}
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-xs font-semibold text-text-main"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              disabled={loading || Boolean(successMsg)}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full rounded-xl border border-surface-border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-md focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-60"
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

        {/* Xác Nhận Mật Khẩu Input - Hiệu ứng Nổi & Nút Ẩn/Hiện */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1.5 block text-xs font-semibold text-text-main"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              disabled={loading || Boolean(successMsg)}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-xl border border-surface-border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus:-translate-y-0.5 focus:border-primary focus:bg-surface-card focus:shadow-md focus:ring-4 focus:ring-ring-brand/15 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition-all duration-200 hover:scale-110 hover:text-text-main"
            >
              {showConfirmPassword ? (
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

        {/* Nút Submit - Hiệu ứng Nổi mềm mại */}
        <button
          type="submit"
          disabled={loading || Boolean(successMsg)}
          className="relative w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-contrast shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin text-primary-contrast" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang tạo tài khoản...</span>
            </div>
          ) : (
            <span>Tạo tài khoản</span>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-xs text-text-sub">
        Đã có tài khoản?{' '}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="inline-block font-semibold text-accent transition-all duration-200 hover:-translate-y-0.5 hover:text-accent-hover hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}