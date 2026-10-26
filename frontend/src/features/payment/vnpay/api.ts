import api from '@/lib/axios/client';
import type { VerifyReturnResponse } from './types';

export async function verifyVNPayReturn(
    params: Record<string, string>,
): Promise<VerifyReturnResponse> {
    const response = await api.get<VerifyReturnResponse>('/payments/vnpay/vnpay-return', {
        params,
    });

    return response.data ?? {};
}
