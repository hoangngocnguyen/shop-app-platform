import { create } from "zustand";
import { categoryApi } from "../api";
import { CategoryResponse } from "../types";
import { parseErrorMessage } from "@/lib/axios/parseError";

interface CategoryState {
    categories: CategoryResponse[];
    isLoading: boolean;
    error: string | null;
    activeCategorySlug: string | null;

    // Actions
    setActiveCategorySlug: (slug: string | null) => void;
    fetchCategories: (force?: boolean) => Promise<CategoryResponse[] | null>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,
    activeCategorySlug: null,

    setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),

    fetchCategories: async (force = false) => {
        // Tối ưu cache bộ nhớ: nếu đã có danh mục thì không tải lại trừ khi ép buộc (force = true)
        const current = get().categories;
        if (!force && current && current.length > 0) {
            return current;
        }

        set({ isLoading: true, error: null });
        try {
            const data = await categoryApi.getCategories();
            set({ categories: Array.isArray(data) ? data : [], isLoading: false });
            return data;
        } catch (err: unknown) {
            const errorMessage = parseErrorMessage(err, "Không thể tải danh sách danh mục");
            set({ error: errorMessage, isLoading: false, categories: [] });
            return null;
        }
    },
}));
