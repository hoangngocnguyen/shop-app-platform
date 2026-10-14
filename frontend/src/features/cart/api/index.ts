import api from "@/lib/axios/client";
import {
    CartResponse,
    AddToCartRequest,
    UpdateCartItemRequest,
    DeleteMultipleCartItemsRequest,
    SyncCartRequest,
} from "../types";

export const cartApi = {
    /**
     * Lấy thông tin giỏ hàng của người dùng đang đăng nhập.
     * GET /cart
     */
    getUserCart: async (): Promise<CartResponse> => {
        const response = await api.get<{ data: CartResponse }>("/cart");
        return response.data.data;
    },

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * POST /cart/items
     */
    addToCart: async (payload: AddToCartRequest): Promise<CartResponse> => {
        const response = await api.post<{ data: CartResponse }>("/cart/items", payload);
        return response.data.data;
    },

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng.
     * PATCH /cart/items/{cart_item_id}
     */
    updateCartItem: async (cartItemId: number, payload: UpdateCartItemRequest): Promise<CartResponse> => {
        const response = await api.patch<{ data: CartResponse }>(`/cart/items/${cartItemId}`, payload);
        return response.data.data;
    },

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     * DELETE /cart/items/{cart_item_id}
     */
    deleteCartItem: async (cartItemId: number): Promise<CartResponse> => {
        const response = await api.delete<{ data: CartResponse }>(`/cart/items/${cartItemId}`);
        return response.data.data;
    },

    /**
     * Xóa nhiều sản phẩm khỏi giỏ hàng.
     * DELETE /cart/items
     */
    deleteMultipleCartItems: async (payload: DeleteMultipleCartItemsRequest): Promise<CartResponse> => {
        const response = await api.delete<{ data: CartResponse }>("/cart/items", {
            data: payload,
        });
        return response.data.data;
    },

    /**
     * Đồng bộ giỏ hàng sau khi đăng nhập.
     * POST /cart/sync
     */
    syncCart: async (payload: SyncCartRequest): Promise<CartResponse> => {
        const response = await api.post<{ data: CartResponse }>("/cart/sync", payload);
        return response.data.data;
    },
};