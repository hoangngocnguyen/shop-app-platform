import { create } from "zustand";
import { cartApi } from "../api";
import {
    CartResponse,
    AddToCartRequest,
    UpdateCartItemRequest,
    DeleteMultipleCartItemsRequest,
    SyncCartRequest,
} from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";

interface CartState {
    cart: CartResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setCart: (cart: CartResponse | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Async Actions
    fetchCart: () => Promise<CartResponse | null>;
    addToCart: (payload: AddToCartRequest) => Promise<CartResponse | null>;
    updateCartItem: (cartItemId: number, payload: UpdateCartItemRequest) => Promise<CartResponse | null>;
    deleteCartItem: (cartItemId: number) => Promise<CartResponse | null>;
    deleteMultipleCartItems: (payload: DeleteMultipleCartItemsRequest) => Promise<CartResponse | null>;
    syncCart: (payload: SyncCartRequest) => Promise<CartResponse | null>;
    reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    setCart: (cart) => set({ cart }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Lấy thông tin giỏ hàng
    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.getUserCart();
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy thông tin giỏ hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (payload: AddToCartRequest) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.addToCart(payload);
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể thêm sản phẩm vào giỏ hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Cập nhật số lượng sản phẩm trong giỏ
    updateCartItem: async (cartItemId: number, payload: UpdateCartItemRequest) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.updateCartItem(cartItemId, payload);
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể cập nhật số lượng sản phẩm");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa 1 sản phẩm khỏi giỏ
    deleteCartItem: async (cartItemId: number) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.deleteCartItem(cartItemId);
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa sản phẩm khỏi giỏ hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa nhiều sản phẩm khỏi giỏ
    deleteMultipleCartItems: async (payload: DeleteMultipleCartItemsRequest) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.deleteMultipleCartItems(payload);
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa các sản phẩm đã chọn");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Đồng bộ giỏ hàng
    syncCart: async (payload: SyncCartRequest) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartApi.syncCart(payload);
            set({ cart, isLoading: false });
            return cart;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể đồng bộ giỏ hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Reset store về trạng thái ban đầu (khi logout)
    reset: () => set({ cart: null, isLoading: false, error: null }),
}));