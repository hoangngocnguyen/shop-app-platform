import { Suspense } from 'react';
import {
    PaymentResultSection,
    PaymentResultSkeleton,
} from '@/features/payment/vnpay';

export default function PaymentResultPage() {
    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-surface-bg px-4 py-8 sm:px-6">
            <div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-card p-5 sm:p-6 shadow-xs">
                <Suspense fallback={<PaymentResultSkeleton />}>
                    <PaymentResultSection />
                </Suspense>
            </div>
        </main>
    );
}
