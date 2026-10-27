export interface VerifyReturnResponse {
    status?: 'Success' | 'Failed' | string;
    order_id?: string;
    amount?: number;
    response_code?: string;
    code?: string;
    message?: string;
}
