import { create } from "zustand";
import { parseErrorMessage } from "@/lib/axios/parseError";
import { paymentApi } from "../api";
import type { CreatePaymentRequest, CreatePaymentResponse } from "../types";

interface PaymentState {
    payment: CreatePaymentResponse | null;
    isLoading: boolean;
    error: string | null;
    createPayment: (payload: CreatePaymentRequest) => Promise<CreatePaymentResponse | null>;
    reset: () => void;
}

const initialState = { payment: null, isLoading: false, error: null };

export const usePaymentStore = create<PaymentState>((set) => ({
    ...initialState,
    createPayment: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const payment = await paymentApi.createPayment(payload);
            set({ payment, isLoading: false });
            return payment;
        } catch (err: unknown) {
            set({ error: parseErrorMessage(err, "Không thể khởi tạo thanh toán"), isLoading: false });
            return null;
        }
    },
    reset: () => set(initialState),
}));
