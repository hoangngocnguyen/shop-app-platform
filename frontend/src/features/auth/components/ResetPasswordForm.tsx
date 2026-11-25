'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mascot } from 'page-mascot';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/common/stores/useToastStore';
import { parseErrorMessage } from '@/lib/axios/parseError';
import { resetPassword } from '../api/auth';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/auth-schema';

function getHashToken(): string {
  if (typeof window === 'undefined') return '';
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return (
    hashParams.get('token_hash') ||
    hashParams.get('access_token') ||
    hashParams.get('token') ||
    ''
  );
}

function subscribeToHash(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramToken =
    searchParams.get('token_hash') ||
    searchParams.get('token') ||
    searchParams.get('code') ||
    '';

  const hashToken = useSyncExternalStore(subscribeToHash, getHashToken, () => '');
  const token = paramToken || hashToken;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMsg(
        'Không tìm thấy mã xác thực khôi phục mật khẩu. Vui lòng yêu cầu lại liên kết mới.'
      );
      return;
    }

    setErrorMsg('');

    try {
      await resetPassword(token, values.password);
      setIsSuccess(true);
      toast.success(
        'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
        'Thành công'
      );
    } catch (err) {
      const parsed = parseErrorMessage(
        err,
        'Đặt lại mật khẩu thất bại. Liên kết có thể đã hết hạn hoặc không hợp lệ.'
      );
      setErrorMsg(parsed);
      toast.error(parsed, 'Lỗi đặt lại mật khẩu');
    }
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-6 shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl sm:p-8">
      {/* Hiệu ứng bong bóng */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        aria-hidden="true"
      >
        <div className="absolute -left-4 -top-4 h-24 w-24 animate-pulse rounded-full bg-primary/10 blur-xl transition-all duration-1000 group-hover:scale-125" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 animate-pulse rounded-full bg-accent/15 blur-2xl transition-all duration-1000 group-hover:scale-110 [animation-delay:1s]" />
      </div>

      {/* Header */}
      <div className="relative mb-8 text-center">
        <Mascot
          directions="/mascots/frog-directions.webp"
          reactions="/mascots/frog-reactions.webp"
          size={104}
          className="mx-auto"
          label="Linh vật ếch"
        />

        <h2 className="text-2xl font-bold tracking-tight text-text-main">
          {isSuccess ? 'Đổi mật khẩu thành công!' : 'Đặt lại mật khẩu'}
        </h2>
        <p className="mt-1.5 text-sm text-text-sub">
          {isSuccess
            ? 'Mật khẩu của bạn đã được cập nhật an toàn'
            : 'Thiết lập mật khẩu mới để bảo vệ tài khoản của bạn'}
        </p>
      </div>

      {/* Màn hình thông báo Thành công */}
      {isSuccess ? (
        <div className="relative space-y-6 text-center">
          <div
            role="status"
            className="flex items-center justify-center rounded-2xl border border-status-success/20 bg-status-success-bg p-5 text-sm font-semibold text-status-success"
          >
            <div className="space-y-1">
              <svg
                className="mx-auto h-8 w-8 text-status-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-bold">Đổi mật khẩu thành công!</p>
              <p className="text-xs font-normal opacity-90">
                Bạn có thể đăng nhập vào hệ thống bằng mật khẩu mới vừa tạo ngay bây giờ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="relative flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-text-inverse text-white shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
          >
            Đăng nhập ngay
          </button>
        </div>
      ) : (
        <>
          {/* Cảnh báo thiếu token */}
          {!token && (
            <div
              role="alert"
              className="relative mb-6 rounded-xl border border-status-warning/20 bg-status-warning-bg p-4 text-xs font-medium text-status-warning"
            >
              <p className="font-bold">Không tìm thấy mã xác thực</p>
              <p className="mt-1">
                Liên kết khôi phục có thể không hợp lệ hoặc thiếu mã xác thực.
                Vui lòng kiểm tra lại liên kết trong email hoặc gửi lại yêu cầu.
              </p>
              <div className="mt-3">
                <Link
                  href={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="font-bold underline hover:opacity-80"
                >
                  Gửi lại yêu cầu quên mật khẩu
                </Link>
              </div>
            </div>
          )}

          {/* Thông báo Lỗi */}
          {errorMsg && (
            <div
              role="alert"
              className="relative mb-6 flex items-center gap-3 rounded-xl border border-status-error/20 bg-status-error-bg p-3.5 text-xs font-medium text-status-error transition-all duration-300 animate-in fade-in slide-in-from-top-2"
            >
              <svg
                className="h-5 w-5 shrink-0 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Đặt lại Mật khẩu */}
          <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5">
            {/* Mật khẩu mới */}
            <div>
              <label
                htmlFor="reset-password"
                className="mb-1.5 block text-xs font-semibold text-text-main"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isSubmitting || !token}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-surface-bg/70 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm backdrop-blur-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                    errors.password
                      ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                      : 'border-surface-border hover:border-primary/50 focus:border-primary focus:ring-ring-brand/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition-all duration-200 hover:scale-110 hover:text-text-main"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 013.682-.813c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-status-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="mb-1.5 block text-xs font-semibold text-text-main"
              >
                Xác nhận lại mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isSubmitting || !token}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-surface-bg/70 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm backdrop-blur-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                    errors.confirmPassword
                      ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                      : 'border-surface-border hover:border-primary/50 focus:border-primary focus:ring-ring-brand/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-muted transition-all duration-200 hover:scale-110 hover:text-text-main"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 013.682-.813c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-medium text-status-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-text-inverse shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Đang cập nhật mật khẩu...</span>
                </>
              ) : (
                <span className='text-white'>Xác nhận đổi mật khẩu</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="relative mt-8 border-t border-surface-border/60 pt-6 text-center">
            <p className="text-xs text-text-sub">
              Nhớ mật khẩu rồi?{' '}
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="font-semibold transition-all duration-200 hover:text-primary-hover hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
