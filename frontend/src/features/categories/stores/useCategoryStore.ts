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
    fetchCategories: () => Promise<CategoryResponse[] | null>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,
    error: null,
    activeCategorySlug: null,

    setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),

    fetchCategories: async () => {
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
