import { create } from "zustand";
import { ProvinceResponse, WardResponse } from "../types";
import { locationApi } from "../api";
import { parseError } from "@/lib/axios/parseError";

interface LocationState {
    provinces: ProvinceResponse[];
    wards: WardResponse[];
    isLoadingProvinces: boolean;
    isLoadingWards: boolean;
    error: string | null;

    // Actions
    setProvinces: (provinces: ProvinceResponse[]) => void;
    setWards: (wards: WardResponse[]) => void;
    setIsLoadingProvinces: (isLoading: boolean) => void;
    setIsLoadingWards: (isLoading: boolean) => void;
    setError: (error: string | null) => void;

    // Async Actions
    fetchProvinces: () => Promise<ProvinceResponse[] | null>;
    fetchWardsByProvince: (provinceCode: string) => Promise<WardResponse[] | null>;
    clearWards: () => void;
    reset: () => void;
}

const initialState = {
    provinces: [],
    wards: [],
    isLoadingProvinces: false,
    isLoadingWards: false,
    error: null,
};

export const useLocationStore = create<LocationState>((set, get) => ({
    ...initialState,

    setProvinces: (provinces) => set({ provinces }),
    setWards: (wards) => set({ wards }),
    setIsLoadingProvinces: (isLoadingProvinces) => set({ isLoadingProvinces }),
    setIsLoadingWards: (isLoadingWards) => set({ isLoadingWards }),
    setError: (error) => set({ error }),

    // Lấy danh sách Tỉnh/Thành phố (Tích hợp Cache: nếu đã có thì không gọi lại API)
    fetchProvinces: async () => {
        if (get().provinces.length > 0) {
            return get().provinces;
        }

        set({ isLoadingProvinces: true, error: null });
        try {
            const provinces = await locationApi.getProvinces();
            set({ provinces, isLoadingProvinces: false });
            return provinces;
        } catch (err: unknown) {
            const errorMessage = parseError(err, "Không thể lấy danh sách Tỉnh/Thành phố");
            set({ error: errorMessage, isLoadingProvinces: false });
            return null;
        }
    },

    // Lấy danh sách Phường/Xã theo Mã Tỉnh/Thành
    fetchWardsByProvince: async (provinceCode: string) => {
        if (!provinceCode) {
            set({ wards: [] });
            return [];
        }

        set({ isLoadingWards: true, error: null });
        try {
            const wards = await locationApi.getWardsByProvince(provinceCode);
            set({ wards, isLoadingWards: false });
            return wards;
        } catch (err: unknown) {
            const errorMessage = parseError(err, "Không thể lấy danh sách Phường/Xã");
            set({ error: errorMessage, wards: [], isLoadingWards: false });
            return null;
        }
    },

    // Xóa danh sách Phường/Xã (khi chọn lại Tỉnh/Thành mới)
    clearWards: () => set({ wards: [] }),

    // Reset về trạng thái ban đầu
    reset: () => set({ ...initialState }),
}));