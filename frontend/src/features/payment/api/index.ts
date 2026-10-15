import api from "@/lib/axios/client";
import type { CreatePaymentRequest, CreatePaymentResponse } from "../types";

export const paymentApi = {
    createPayment: async (payload: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
        const response = await api.post<CreatePaymentResponse>("/payments/create-payment", payload);
        return response.data;
    },
};

export type { CreatePaymentRequest, CreatePaymentResponse } from "../types";
