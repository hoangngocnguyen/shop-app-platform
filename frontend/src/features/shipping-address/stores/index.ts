import { create } from "zustand";
import {
    ShippingAddressResponse,
    ShippingAddressCreate,
    ShippingAddressUpdate,
} from "../types";
import { shippingAddressApi } from "../api";
import { parseErrorMessage } from "@/lib/axios/parseError";

interface ShippingAddressState {
    addresses: ShippingAddressResponse[];
    selectedAddress: ShippingAddressResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setAddresses: (addresses: ShippingAddressResponse[]) => void;
    setSelectedAddress: (address: ShippingAddressResponse | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Async Actions
    fetchUserAddresses: () => Promise<ShippingAddressResponse[] | null>;
    fetchAddressById: (addressId: number) => Promise<ShippingAddressResponse | null>;
    createAddress: (payload: ShippingAddressCreate) => Promise<ShippingAddressResponse | null>;
    updateAddress: (
        addressId: number,
        payload: ShippingAddressUpdate
    ) => Promise<ShippingAddressResponse | null>;
    deleteAddress: (addressId: number) => Promise<boolean>;
    reset: () => void;
}

const initialState = {
    addresses: [],
    selectedAddress: null,
    isLoading: false,
    error: null,
};

export const useShippingAddressStore = create<ShippingAddressState>((set) => ({
    ...initialState,

    setAddresses: (addresses) => set({ addresses }),
    setSelectedAddress: (selectedAddress) => set({ selectedAddress }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Lấy danh sách địa chỉ của người dùng
    fetchUserAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
            const addresses = await shippingAddressApi.getUserAddresses();
            set({ addresses, isLoading: false });
            return addresses;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage
                (err, "Không thể lấy danh sách địa chỉ giao hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Lấy chi tiết một địa chỉ theo ID
    fetchAddressById: async (addressId: number) => {
        set({ isLoading: true, error: null });
        try {
            const address = await shippingAddressApi.getAddressById(addressId);
            set({ selectedAddress: address, isLoading: false });
            return address;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể lấy thông tin chi tiết địa chỉ");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Tạo mới địa chỉ giao hàng
    createAddress: async (payload: ShippingAddressCreate) => {
        set({ isLoading: true, error: null });
        try {
            const newAddress = await shippingAddressApi.createAddress(payload);
            set((state) => ({
                addresses: [...state.addresses, newAddress],
                isLoading: false,
            }));
            return newAddress;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tạo địa chỉ giao hàng mới");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Cập nhật thông tin địa chỉ giao hàng
    updateAddress: async (addressId: number, payload: ShippingAddressUpdate) => {
        set({ isLoading: true, error: null });
        try {
            const updatedAddress = await shippingAddressApi.updateAddress(addressId, payload);
            set((state) => ({
                addresses: state.addresses.map((item) =>
                    item.id === addressId ? updatedAddress : item
                ),
                selectedAddress:
                    state.selectedAddress?.id === addressId
                        ? updatedAddress
                        : state.selectedAddress,
                isLoading: false,
            }));
            return updatedAddress;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể cập nhật địa chỉ giao hàng");
            set({ error: errorMessage, isLoading: false });
            return null;
        }
    },

    // Xóa địa chỉ giao hàng
    deleteAddress: async (addressId: number) => {
        set({ isLoading: true, error: null });
        try {
            await shippingAddressApi.deleteAddress(addressId);
            set((state) => ({
                addresses: state.addresses.filter((item) => item.id !== addressId),
                selectedAddress:
                    state.selectedAddress?.id === addressId ? null : state.selectedAddress,
                isLoading: false,
            }));
            return true;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể xóa địa chỉ giao hàng");
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    // Reset state về ban đầu
    reset: () => set(initialState),
}));