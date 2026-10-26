import { Suspense } from 'react';
import {
    PaymentResultSection,
    PaymentResultSkeleton,
} from '@/features/payment/vnpay';

export default function PaymentResultPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-surface-bg px-4 py-10 sm:px-6">
            <div className="w-full max-w-lg rounded-3xl border border-surface-border bg-surface-card p-6 shadow-brand-md sm:p-8">
                <Suspense fallback={<PaymentResultSkeleton />}>
                    <PaymentResultSection />
                </Suspense>
            </div>
        </main>
    );
}
