export interface CreatePaymentPayload {
    amount: number;
    order_info: string;
}

export interface CreatePaymentResponse {
    payment_url: string;
}

export interface VerifyReturnResponse {
    status?: 'Success' | 'Failed' | string;
    order_id?: string;
    amount?: number;
    response_code?: string;
    code?: string;
    message?: string;
}
