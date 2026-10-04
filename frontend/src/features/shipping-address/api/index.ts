import api from "@/lib/axios/client";
import {
    ShippingAddressResponse,
    ShippingAddressCreate,
    ShippingAddressUpdate,
    DeleteShippingAddressResponse,
} from "../types";

export const shippingAddressApi = {
    /**
     * Lấy danh sách địa chỉ giao hàng của người dùng đang đăng nhập.
     * GET /shipping-addresses
     */
    getUserAddresses: async (): Promise<ShippingAddressResponse[]> => {
        const response = await api.get<ShippingAddressResponse[]>("/shipping-addresses");
        return response.data;
    },

    /**
     * Lấy chi tiết một địa chỉ giao hàng theo ID.
     * GET /shipping-addresses/{address_id}
     */
    getAddressById: async (addressId: number): Promise<ShippingAddressResponse> => {
        const response = await api.get<ShippingAddressResponse>(`/shipping-addresses/${addressId}`);
        return response.data;
    },

    /**
     * Tạo địa chỉ giao hàng mới cho người dùng.
     * POST /shipping-addresses
     */
    createAddress: async (payload: ShippingAddressCreate): Promise<ShippingAddressResponse> => {
        const response = await api.post<ShippingAddressResponse>("/shipping-addresses", payload);
        return response.data;
    },

    /**
     * Cập nhật thông tin địa chỉ giao hàng.
     * PUT /shipping-addresses/{address_id}
     */
    updateAddress: async (
        addressId: number,
        payload: ShippingAddressUpdate
    ): Promise<ShippingAddressResponse> => {
        const response = await api.put<ShippingAddressResponse>(`/shipping-addresses/${addressId}`, payload);
        return response.data;
    },

    /**
     * Xóa địa chỉ giao hàng theo ID.
     * DELETE /shipping-addresses/{address_id}
     */
    deleteAddress: async (addressId: number): Promise<DeleteShippingAddressResponse> => {
        const response = await api.delete<DeleteShippingAddressResponse>(`/shipping-addresses/${addressId}`);
        return response.data;
    },
};