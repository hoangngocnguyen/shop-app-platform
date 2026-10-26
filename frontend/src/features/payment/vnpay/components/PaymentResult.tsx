'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { verifyVNPayReturn } from '../api';
import type { VerifyReturnResponse } from '../types';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerifyReturnResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params: Record<string, string> = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                if (Object.keys(params).length === 0) {
                    setErrorMsg('Không tìm thấy tham số phản hồi từ VNPay.');
                    setLoading(false);
                    return;
                }

                const data = await verifyVNPayReturn(params);
                setResult(data);
            } catch (error: any) {
                console.error('Lỗi xác minh thanh toán:', error);
                setErrorMsg(error.response?.data?.detail || 'Chữ ký không hợp lệ hoặc có lỗi hệ thống.');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-3 text-center text-text-sub">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-surface-border border-t-primary" />
                <p className="font-medium">Đang xác minh kết quả thanh toán từ VNPay...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-5xl text-red-500">⚠️</div>
                <h2 className="text-xl font-bold text-text-main">Giao dịch thất bại</h2>
                <p className="text-sm text-red-600">{errorMsg}</p>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => router.push(ROUTES.USER.ORDERS)}
                        className="flex-1 rounded-lg bg-text-main px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Xem đơn hàng
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(ROUTES.HOME)}
                        className="flex-1 rounded-lg border border-surface-border bg-white px-6 py-2.5 text-sm font-semibold text-text-main transition hover:bg-surface-bg"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const isSuccess = result?.status === 'Success';

    return (
        <div className="flex flex-col items-center gap-5 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full text-5xl font-extrabold ${isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                {isSuccess ? '✓' : '✕'}
            </div>
            <h2 className="text-2xl font-bold text-text-main">{isSuccess ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}</h2>

            {isSuccess ? (
                <div className="w-full space-y-2 rounded-2xl border border-surface-border bg-surface-bg p-4 text-left text-sm text-text-sub">
                    <p className="flex justify-between gap-3"><span className="font-semibold text-text-main">Mã đơn hàng:</span> <span>{result?.order_id || '—'}</span></p>
                    <p className="flex justify-between gap-3"><span className="font-semibold text-text-main">Số tiền:</span> <span>{result?.amount?.toLocaleString('vi-VN') ?? '—'} VND</span></p>
                    <p className="flex justify-between gap-3"><span className="font-semibold text-text-main">Mã phản hồi:</span> <span>{result?.response_code || '—'}</span></p>
                </div>
            ) : (
                <p className="text-text-sub">
                    {result?.code ? `Mã lỗi phản hồi: ${result.code}` : result?.message || 'Đã xảy ra lỗi khi xử lý giao dịch.'}
                </p>
            )}

            <div className="flex w-full flex-col gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={() => router.push(ROUTES.HOME)}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast shadow-md transition hover:bg-primary-hover"
                >
                    Tiếp tục mua sắm
                </button>
                <button
                    type="button"
                    onClick={() => router.push(ROUTES.USER.ORDERS)}
                    className="flex-1 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-surface-bg"
                >
                    Xem đơn hàng
                </button>
            </div>
        </div>
    );
}

export function PaymentResultSection() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-4 text-sm font-medium text-text-sub">Đang tải...</div>}>
            <PaymentResultContent />
        </Suspense>
    );
}
