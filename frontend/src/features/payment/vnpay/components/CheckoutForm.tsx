'use client';

import { useState } from 'react';
import { createPaymentUrl } from '../api';

export function CheckoutForm() {
    const [amount, setAmount] = useState<number>(50000);
    const [orderInfo, setOrderInfo] = useState('Thanh toán đơn hàng #123456');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handlePayment = async () => {
        const sanitizedOrderInfo = orderInfo.trim();

        if (!sanitizedOrderInfo) {
            setErrorMsg('Vui lòng nhập nội dung thanh toán.');
            return;
        }

        if (amount <= 0) {
            setErrorMsg('Số tiền thanh toán phải lớn hơn 0.');
            return;
        }

        try {
            setLoading(true);
            setErrorMsg('');

            const paymentUrl = await createPaymentUrl({
                amount,
                order_info: sanitizedOrderInfo,
            });

            if (!paymentUrl) {
                throw new Error('Không nhận được URL thanh toán từ hệ thống.');
            }

            window.location.assign(paymentUrl);
        } catch (error) {
            console.error('Lỗi khởi tạo thanh toán VNPay:', error);
            setErrorMsg('Không thể kết nối tới cổng thanh toán. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-bg p-4">
            <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md">
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        VNPay
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-text-main">Xác nhận đơn hàng</h1>
                </div>

                <div className="space-y-4 border-y border-surface-border py-4">
                    <div className="space-y-2">
                        <label htmlFor="orderInfo" className="block text-xs font-semibold text-text-sub">
                            Nội dung thanh toán
                        </label>
                        <input
                            id="orderInfo"
                            type="text"
                            value={orderInfo}
                            onChange={(event) => setOrderInfo(event.target.value)}
                            className="w-full rounded-xl border border-surface-border bg-surface-bg px-3 py-3 text-sm text-text-main outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
                            placeholder="Nhập nội dung đơn hàng"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="amount" className="block text-xs font-semibold text-text-sub">
                            Số tiền
                        </label>
                        <input
                            id="amount"
                            type="number"
                            min={1000}
                            step={1000}
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value || 0))}
                            className="w-full rounded-xl border border-surface-border bg-surface-bg px-3 py-3 text-right text-sm font-bold text-primary outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]"
                        />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-primary-light/40 p-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-sub">Tổng thanh toán</span>
                        <strong className="text-lg text-text-main">{Number(amount).toLocaleString('vi-VN')} VND</strong>
                    </div>
                    <p className="max-w-48 text-right text-[11px] text-text-sub">
                        Đơn hàng sẽ được xác nhận và thanh toán an toàn qua cổng VNPay.
                    </p>
                </div>

                {errorMsg && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                        {errorMsg}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handlePayment}
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-contrast shadow-md transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? 'Đang chuyển hướng sang VNPay...' : 'Thanh toán qua VNPay'}
                </button>
            </div>
        </main>
    );
}
