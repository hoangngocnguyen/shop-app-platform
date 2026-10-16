import React from "react";
import { Trash2 } from "lucide-react";

interface CartToolbarProps {
    isAllSelected: boolean;
    onToggleSelectAll: () => void;
    selectedCount: number;
    onDeleteSelected: () => void;
}

export default function CartToolbar({
    isAllSelected,
    onToggleSelectAll,
    selectedCount,
    onDeleteSelected,
}: CartToolbarProps) {
    return (
        <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-4">
            <label className="flex items-center gap-3 text-sm font-medium text-text-sub cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span>Chọn tất cả sản phẩm</span>
            </label>

            {selectedCount > 0 && (
                <button
                    type="button"
                    onClick={onDeleteSelected}
                    className="flex items-center gap-1.5 text-xs text-status-error hover:underline cursor-pointer font-medium"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa các mục đã chọn ({selectedCount})</span>
                </button>
            )}
        </div>
    );
}

