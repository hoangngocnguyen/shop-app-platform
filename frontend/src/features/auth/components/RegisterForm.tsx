'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mascot } from 'page-mascot';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/common/stores/useToastStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterFormValues } from '../schemas/auth-schema';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const sync = useAuthStore((state) => state.sync);

  // Áp dụng React Hook Form kết hợp Zod Resolver theo quy chuẩn Tiêu chí 4
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (!data.session) {
        const message = 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.';
        setSuccessMsg(message);
        toast.success(message, 'Đăng ký thành công');
        return;
      }

      const user = await sync();
      if (!user) {
        await supabase.auth.signOut();
        setErrorMsg('Đăng ký thành công nhưng không thể đồng bộ tài khoản. Vui lòng thử đăng nhập lại.');
        return;
      }

      toast.success('Tài khoản đã được tạo thành công.', 'Đăng ký thành công');
      router.replace(ROUTES.USER.PROFILE);
      router.refresh();
    } catch (submitError) {
      setErrorMsg(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể tạo tài khoản. Vui lòng thử lại.',
      );
    }
  };

  return (
    <div className="group relative w-full rounded-3xl border border-surface-border bg-surface-card p-6 shadow-xl transition-all duration-300 hover:border-primary/30 hover:shadow-2xl sm:p-8">
      
      {/* Header & Logo Đăng Ký Chuyển Động Sang Trọng */}
      <div className="mb-8 text-center">
        <Mascot
          directions="/mascots/frog-directions.webp"
          reactions="/mascots/frog-reactions.webp"
          size={104}
          className="mx-auto"
          label="Linh vật ếch"
        />

        <h2 className="text-2xl font-bold tracking-tight text-text-main">
          Tạo tài khoản
        </h2>
        <p className="mt-1.5 text-sm text-text-sub">
          Đăng ký để bắt đầu trải nghiệm HoangShop
        </p>
      </div>

      {/* Thông báo lỗi từ Supabase/Auth */}
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

      {/* Form Đăng Ký dùng React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
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
              type="email"
              autoComplete="email"
              disabled={isSubmitting || Boolean(successMsg)}
              {...register('email')}
              placeholder="name@example.com"
              className={`w-full rounded-xl border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                errors.email
                  ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                  : 'border-surface-border hover:border-primary/60 focus:border-primary focus:ring-ring-brand/15'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-status-error font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Mật Khẩu Input */}
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
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting || Boolean(successMsg)}
              {...register('password')}
              placeholder="Ít nhất 6 ký tự"
              className={`w-full rounded-xl border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                errors.password
                  ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                  : 'border-surface-border hover:border-primary/60 focus:border-primary focus:ring-ring-brand/15'
              }`}
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-status-error font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Xác Nhận Mật Khẩu Input */}
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
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting || Boolean(successMsg)}
              {...register('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              className={`w-full rounded-xl border bg-surface-bg/60 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                errors.confirmPassword
                  ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                  : 'border-surface-border hover:border-primary/60 focus:border-primary focus:ring-ring-brand/15'
              }`}
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
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-status-error font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Nút Submit Main */}
        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMsg)}
          className="relative w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-contrast shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
        >
          {isSubmitting ? (
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
