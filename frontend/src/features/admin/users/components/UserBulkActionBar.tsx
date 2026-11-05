import React from "react";
import { CheckCircle2, Trash2 } from "lucide-react";

interface UserBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export const UserBulkActionBar: React.FC<UserBulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-light px-5 py-3.5 text-sm shadow-md transition-all duration-300 animate-in fade-in zoom-in-95">
      <span className="font-bold text-primary flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Đã chọn <span className="underline decoration-2">{selectedCount}</span> tài khoản
      </span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onClearSelection}
          className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-text-sub transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-card hover:text-text-main hover:shadow-xs cursor-pointer font-medium"
        >
          Bỏ chọn
        </button>

        <button
          type="button"
          onClick={onDeleteSelected}
          className="group/delbtn inline-flex items-center gap-1.5 rounded-xl bg-status-error px-4 py-2 font-medium text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md active:translate-y-0 cursor-pointer"
        >
          <Trash2 className="size-4 transition-transform duration-200 group-hover/delbtn:scale-110" aria-hidden="true" />
          <span>Xóa mục đã chọn</span>
        </button>
      </div>
    </div>
  );
};