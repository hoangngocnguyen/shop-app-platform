import { create } from "zustand";

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

interface ConfirmState {
    isOpen: boolean;
    options: ConfirmOptions;
    resolver: ((value: boolean) => void) | null;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    close: (result: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
    isOpen: false,
    options: { message: "" },
    resolver: null,
    confirm: (options) => {
        return new Promise<boolean>((resolve) => {
            set({
                isOpen: true,
                options,
                resolver: resolve, // Lưu hàm resolve trực tiếp
            });
        });
    },
    close: (result) => {
        const { resolver } = get();
        if (resolver) resolver(result);
        set({ isOpen: false, resolver: null });
    },
}));

// Helper function gọi ở bất kỳ đâu (kể cả ngoài React Component/Hook)
export const confirm = (options: ConfirmOptions) =>
    useConfirmStore.getState().confirm(options);