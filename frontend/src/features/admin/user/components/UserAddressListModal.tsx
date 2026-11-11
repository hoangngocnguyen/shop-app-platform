"use client";

import React from "react";
import { MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { ShippingAddressResponse } from "../types";

interface UserAddressListModalProps {
  addresses: ShippingAddressResponse[];
  userName?: string;
  onClose: () => void;
}

export function UserAddressListModal({
  addresses,
  userName,
  onClose,
}: UserAddressListModalProps) {
  return (
    <ModalShell
      title={`Địa chỉ giao hàng ${userName ? `(${userName})` : ""}`}
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {(!addresses || addresses.length === 0) ? (
          <div className="py-10 text-center text-text-sub text-sm">
            Người dùng chưa lưu địa chỉ giao hàng nào.
          </div>
        ) : (
          addresses.map((addr, idx) => {
            const isDefault = Boolean(addr.isDefault);
            const addressParts = [
              addr.detailAddress,
              addr.ward,
              addr.district,
              addr.province,
            ].filter(Boolean);

            return (
              <div
                key={addr.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isDefault
                    ? "border-primary/40 bg-primary-light/30 shadow-xs"
                    : "border-surface-border bg-surface-bg/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text-main flex items-center gap-1.5">
                      <User className="size-3.5 text-text-muted" />
                      {addr.recipientName || userName || "Người nhận"}
                    </span>
                    {addr.phone && (
                      <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                        <Phone className="size-3" />
                        {addr.phone}
                      </span>
                    )}
                  </div>
                  {isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="size-3" /> Mặc định
                    </span>
                  )}
                </div>

                <div className="text-xs text-text-sub flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="size-3.5 text-text-muted shrink-0 mt-0.5" />
                  <span>{addressParts.join(", ") || "Chưa có địa chỉ chi tiết"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-surface-border flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-surface-border bg-surface-bg text-sm font-semibold text-text-main hover:bg-surface-hover cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </ModalShell>
  );
}

export default UserAddressListModal;
