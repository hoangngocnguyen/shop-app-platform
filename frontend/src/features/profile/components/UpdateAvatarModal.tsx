"use client";

import React, { useState, useRef } from "react";
import { X, Camera, Upload, Loader2, User } from "lucide-react";
import { useProfileStore } from "../stores";

interface UpdateAvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpdateAvatarModal({ isOpen, onClose }: UpdateAvatarModalProps) {
    const { profile, updateAvatar } = useProfileStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsSubmitting(true);
        const res = await updateAvatar(selectedFile);
        setIsSubmitting(false);

        if (res) {
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Khung Card chính */}
            <div
                className="group relative bg-surface-card w-full max-w-md rounded-3xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-300 transition-all hover:border-primary/40"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background quầng sáng mờ */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl -z-10" aria-hidden="true">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary-light/60 rounded-full blur-3xl" />
                </div>

                {/* Header Modal */}
                <div className="relative flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-bg/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-main tracking-tight">Cập nhật ảnh đại diện</h3>
                            <p className="text-[11px] text-text-muted">Tải lên hình ảnh cá nhân mới cho tài khoản</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-text-muted hover:text-text-main p-2 rounded-2xl hover:bg-surface-hover transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="relative p-6 sm:p-7 space-y-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        {/* Avatar Review */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group/avatar w-28 h-28 rounded-full overflow-hidden border-4 border-surface-card bg-primary-light flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-14 h-14 text-primary" />
                            )}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-primary font-bold">
                                <Camera className="w-6 h-6 mb-1 text-primary" />
                                <span className="text-[10px]">Thay đổi</span>
                            </div>
                        </div>

                        {/* Nút chọn tệp */}
                        <div className="w-full space-y-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full px-4 py-3 border border-surface-border bg-surface-bg hover:bg-primary-light/40 hover:border-primary/50 text-text-main text-xs font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 group/btn"
                            >
                                <Upload className="w-4 h-4 text-text-muted group-hover/btn:text-primary transition-colors duration-300" />
                                <span className="truncate">{selectedFile ? selectedFile.name : "Chọn tệp hình ảnh từ máy..."}</span>
                            </button>
                            <p className="text-[11px] text-text-muted">
                                Hỗ trợ định dạng SVG, PNG, JPG hoặc GIF (Tối đa 5MB).
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-2xl border border-surface-border bg-surface-bg hover:bg-surface-hover text-text-sub text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || isSubmitting}
                            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            Tải ảnh lên
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}