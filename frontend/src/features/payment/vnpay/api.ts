import api from '@/lib/axios/client';
import type { CreatePaymentPayload, CreatePaymentResponse, VerifyReturnResponse } from './types';

export async function createPaymentUrl(payload: CreatePaymentPayload): Promise<string> {
    const response = await api.get<CreatePaymentResponse>('/vnpay/create-payment', {
        params: payload,
    });

    return response.data?.payment_url ?? '';
}

export async function verifyVNPayReturn(
    params: Record<string, string>,
): Promise<VerifyReturnResponse> {
    const response = await api.get<VerifyReturnResponse>('/vnpay/vnpay-return', {
        params,
    });

    return response.data ?? {};
}
