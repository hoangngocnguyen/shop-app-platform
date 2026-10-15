import { PaymentResultSection } from '@/features/payment/vnpay/components/PaymentResult';

export default function PaymentResultPage() {
    return (
        <main className="checkout-shell">
            <div className="checkout-card checkout-card--result">
                <PaymentResultSection />
            </div>
        </main>
    );
}
