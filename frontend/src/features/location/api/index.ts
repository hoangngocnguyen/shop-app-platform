import api from "@/lib/axios/client";
import { ProvinceResponse, WardResponse } from "../types";

export const locationApi = {
    /**
     * Lấy danh sách Tỉnh/Thành phố
     * GET /locations/provinces
     */
    getProvinces: async (): Promise<ProvinceResponse[]> => {
        const response = await api.get<ProvinceResponse[]>("/locations/provinces");
        return response.data;
    },

    /**
     * Lấy danh sách Phường/Xã theo Mã Tỉnh/Thành
     * GET /locations/provinces/{province_code}/wards
     */
    getWardsByProvince: async (provinceCode: string): Promise<WardResponse[]> => {
        const response = await api.get<WardResponse[]>(
            `/locations/provinces/${provinceCode}/wards`
        );
        return response.data;
    },
};