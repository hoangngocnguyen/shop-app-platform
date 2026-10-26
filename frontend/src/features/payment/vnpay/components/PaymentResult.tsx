'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    AlertCircle,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    FileQuestion,
    RotateCcw,
    ShoppingBag,
    XCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { verifyVNPayReturn } from '../api';
import type { VerifyReturnResponse } from '../types';

/**
 * Bảng ánh xạ thông điệp phản hồi từ cổng VNPay thân thiện với người dùng
 */
const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
    '00': 'Giao dịch thành công.',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ gian lận.',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
    '10': 'Xác thực OTP không thành công hoặc quá số lần quy định.',
    '11': 'Đã hết thời gian chờ thanh toán. Vui lòng thử lại.',
    '12': 'Thẻ hoặc tài khoản ngân hàng của bạn đang bị khóa.',
    '13': 'Nhập sai mật khẩu xác thực quá số lần quy định.',
    '24': 'Giao dịch đã được hủy theo yêu cầu của bạn.',
    '51': 'Tài khoản không đủ số dư để thực hiện thanh toán.',
    '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang trong thời gian bảo trì.',
    '99': 'Lỗi không xác định từ hệ thống cổng thanh toán VNPay.',
};

const formatMoney = (value?: number | string) => {
    if (value === undefined || value === null) return '—';
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

/**
 * 1. LOADING STATE - Skeleton mô phỏng toàn bộ thẻ Receipt
 */
export function PaymentResultSkeleton() {
    return (
        <div className="flex flex-col items-center space-y-5 text-center animate-pulse">
            <Skeleton variant="circular" className="h-14 w-14" />
            <div className="space-y-1.5 w-full flex flex-col items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="w-full rounded-xl border border-surface-border bg-surface-bg/50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
            <div className="w-full space-y-2 pt-1">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    );
}

/**
 * Component chính xử lý hiển thị kết quả VNPay Return
 */
export function PaymentResultSection() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [result, setResult] = useState<VerifyReturnResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Chuyển toàn bộ searchParams thành record
    const queryParams = useMemo(() => {
        const params: Record<string, string> = {};
        searchParams.forEach((val, key) => {
            params[key] = val;
        });
        return params;
    }, [searchParams]);

    const hasParams = useMemo(() => Object.keys(queryParams).length > 0, [queryParams]);

    const handleVerify = useCallback(async () => {
        if (!hasParams) {
            setIsLoading(false);
            return;
        }

        try {
            setErrorMessage(null);
            const data = await verifyVNPayReturn(queryParams);
            setResult(data);
        } catch (error: any) {
            const apiMsg =
                error?.response?.data?.message ||
                error?.response?.data?.detail ||
                'Chữ ký bảo mật không hợp lệ hoặc lỗi kết nối với máy chủ.';
            setErrorMessage(apiMsg);
        } finally {
            setIsLoading(false);
            setIsRetrying(false);
        }
    }, [hasParams, queryParams]);

    useEffect(() => {
        handleVerify();
    }, [handleVerify]);

    const handleRetry = () => {
        setIsRetrying(true);
        handleVerify();
    };

    // 1. Trạng thái Loading
    if (isLoading) {
        return <PaymentResultSkeleton />;
    }

    // 2. Trạng thái Empty: Người dùng vào thẳng trang mà không có tham số VNPay
    if (!hasParams) {
        return (
            <EmptyState
                icon={FileQuestion}
                title="Không tìm thấy thông tin giao dịch"
                description="Đường dẫn không chứa thông tin phản hồi từ cổng VNPay hoặc phiên giao dịch đã hết hạn."
                action={{
                    label: 'Xem đơn hàng của bạn',
                    onClick: () => router.push(ROUTES.USER.ORDERS),
                }}
            />
        );
    }

    // 3. Trạng thái Error: Lỗi mạng hoặc Checksum không hợp lệ
    if (errorMessage) {
        return (
            <div className="flex flex-col items-center text-center space-y-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-status-error-bg text-status-error">
                    <AlertCircle className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
                        Xác minh giao dịch thất bại
                    </h2>
                    <p className="text-xs sm:text-sm text-text-sub max-w-sm mx-auto">
                        {errorMessage}
                    </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleRetry}
                        isLoading={isRetrying}
                        className="w-full"
                    >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Thử xác minh lại
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(ROUTES.USER.ORDERS)}
                        className="w-full"
                    >
                        <ClipboardList className="w-4 h-4 mr-1.5" />
                        Xem danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }

    // 4. Trạng thái Kết quả: Thành công hoặc Thất bại từ cổng VNPay
    const responseCode = result?.response_code || queryParams.vnp_ResponseCode || '';
    const isSuccess = result?.status === 'Success' || responseCode === '00';
    const orderId = result?.order_id || queryParams.vnp_TxnRef?.split('_')[0] || '—';
    const amount = result?.amount ?? (Number(queryParams.vnp_Amount || 0) / 100);
    const transactionNo = queryParams.vnp_TransactionNo;
    const bankCode = queryParams.vnp_BankCode;
    const failureReason =
        VNPAY_RESPONSE_MESSAGES[responseCode] ||
        result?.message ||
        'Giao dịch không thành công hoặc đã bị hủy bỏ.';

    return (
        <div className="flex flex-col items-center text-center space-y-5">
            {/* Icon & Huy hiệu trạng thái */}
            <div className="flex flex-col items-center gap-2.5">
                <span className="inline-flex items-center justify-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                    Cổng thanh toán VNPAY
                </span>

                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                        isSuccess
                            ? 'bg-status-success-bg text-status-success'
                            : 'bg-status-error-bg text-status-error'
                    }`}
                >
                    {isSuccess ? (
                        <CheckCircle2 className="h-8 w-8" />
                    ) : (
                        <XCircle className="h-8 w-8" />
                    )}
                </div>
            </div>

            {/* Tiêu đề & Diễn giải */}
            <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main">
                    {isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công'}
                </h1>
                <p className="text-xs sm:text-sm text-text-sub max-w-md mx-auto leading-relaxed">
                    {isSuccess
                        ? 'Cảm ơn bạn! Đơn hàng đã được xác nhận thanh toán thành công và đang được chuẩn bị.'
                        : failureReason}
                </p>
            </div>

            {/* Thẻ Chi tiết biên lai (Receipt Card) */}
            <div className="w-full rounded-xl border border-surface-border bg-surface-bg/50 p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5">
                <div className="flex items-center justify-between gap-3 border-b border-surface-border/60 pb-2.5">
                    <span className="font-medium text-text-muted">
                        Mã đơn hàng
                    </span>
                    <span className="font-mono font-semibold text-text-main">#{orderId}</span>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-surface-border/60 pb-2.5">
                    <span className="font-medium text-text-muted">
                        Số tiền thanh toán
                    </span>
                    <span className="text-base font-bold text-price">
                        {formatMoney(amount)}
                    </span>
                </div>

                {bankCode && (
                    <div className="flex items-center justify-between gap-3 border-b border-surface-border/60 pb-2.5">
                        <span className="font-medium text-text-muted">
                            Ngân hàng / Ví
                        </span>
                        <span className="font-semibold text-text-main uppercase">{bankCode}</span>
                    </div>
                )}

                {transactionNo && transactionNo !== '0' && (
                    <div className="flex items-center justify-between gap-3 border-b border-surface-border/60 pb-2.5">
                        <span className="font-medium text-text-muted">
                            Mã giao dịch VNPay
                        </span>
                        <span className="font-mono text-xs text-text-sub">{transactionNo}</span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <span className="font-medium text-text-muted">
                        Trạng thái thanh toán
                    </span>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isSuccess
                                ? 'border border-status-success/25 bg-status-success-bg text-status-success'
                                : 'border border-status-error/25 bg-status-error-bg text-status-error'
                        }`}
                    >
                        {isSuccess ? 'Đã thanh toán' : 'Chưa hoàn tất'}
                    </span>
                </div>
            </div>

            {/* Bộ nút CTA hành động */}
            <div className="w-full space-y-2 pt-1">
                {isSuccess ? (
                    <>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => router.push(ROUTES.USER.ORDERS)}
                            className="w-full"
                        >
                            <ClipboardList className="w-4 h-4 mr-1.5" />
                            Xem lịch sử đơn hàng
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(ROUTES.HOME)}
                            className="w-full"
                        >
                            <ShoppingBag className="w-4 h-4 mr-1.5" />
                            Tiếp tục mua sắm
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => router.push(ROUTES.USER.ORDERS)}
                            className="w-full"
                        >
                            <CreditCard className="w-4 h-4 mr-1.5" />
                            Vào đơn hàng để thanh toán lại
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(ROUTES.HOME)}
                            className="w-full"
                        >
                            <ShoppingBag className="w-4 h-4 mr-1.5" />
                            Về trang chủ
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
