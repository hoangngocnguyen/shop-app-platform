import type { PaymentMethod, Money } from "@/features/orders/types";

export interface CreatePaymentRequest { order_id: string }
export interface CreatePaymentResponse {
    order_id: string;
    payment_method: PaymentMethod;
    amount: Money;
    payment_url: string | null;
    message: string;
}
