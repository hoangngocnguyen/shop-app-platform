'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mascot } from 'page-mascot';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/common/stores/useToastStore';
import { parseErrorMessage } from '@/lib/axios/parseError';
import { forgotPassword } from '../api/auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/auth-schema';

export function ForgotPasswordForm() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await forgotPassword(values.email.trim());
      const msg =
        'Nếu email tồn tại trên hệ thống, liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến (và mục Spam).';
      setSuccessMsg(msg);
      toast.success(msg, 'Đã gửi yêu cầu');
    } catch (err) {
      const parsed = parseErrorMessage(
        err,
        'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.'
      );
      setErrorMsg(parsed);
      toast.error(parsed, 'Lỗi gửi yêu cầu');
    }
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-surface-border bg-surface-card p-6 shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl sm:p-8">
      {/* Hiệu ứng bong bóng nền */}
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
          Quên mật khẩu?
        </h2>
        <p className="mt-1.5 text-sm text-text-sub">
          Nhập địa chỉ email của bạn để nhận liên kết khôi phục mật khẩu an toàn
        </p>
      </div>

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

      {/* Thông báo Thành công */}
      {successMsg && (
        <div
          role="status"
          className="relative mb-6 flex items-start gap-3 rounded-xl border border-status-success/20 bg-status-success-bg p-4 text-xs font-semibold text-status-success transition-all duration-300 animate-in fade-in slide-in-from-top-2"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div className="leading-relaxed">
            <p className="font-bold">Đã gửi email khôi phục!</p>
            <p className="mt-1 font-normal opacity-90">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-1.5 block text-xs font-semibold text-text-main"
          >
            Địa chỉ Email
          </label>
          <div className="relative">
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting || Boolean(successMsg)}
              {...register('email')}
              placeholder="name@example.com"
              className={`w-full rounded-xl border bg-surface-bg/70 px-4 py-3 text-sm text-text-main placeholder-text-muted shadow-sm backdrop-blur-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:bg-surface-card focus:shadow-md focus:ring-4 disabled:opacity-60 ${
                errors.email
                  ? 'border-status-error focus:border-status-error focus:ring-status-error/15'
                  : 'border-surface-border hover:border-primary/50 focus:border-primary focus:ring-ring-brand/15'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-status-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMsg)}
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
              <span>Đang gửi liên kết...</span>
            </>
          ) : (
            <span className='text-white'>Gửi liên kết khôi phục</span>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="relative mt-8 border-t border-surface-border/60 pt-6 text-center">
        <p className="text-xs text-text-sub">
          Bạn nhớ lại mật khẩu rồi?{' '}
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-semibold text-primary transition-all duration-200 hover:text-primary-hover hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
