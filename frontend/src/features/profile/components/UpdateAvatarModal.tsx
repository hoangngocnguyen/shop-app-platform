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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="group relative bg-surface-card w-full max-w-md rounded-3xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-300 transition-all hover:border-primary/40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
                    <div className="absolute -left-6 -top-6 h-32 w-32 animate-pulse rounded-full bg-primary/10 blur-2xl transition-all duration-1000 group-hover:scale-125" />
                </div>

                {/* Header Modal */}
                <div className="relative flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-bg/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shadow-inner">
                            <Camera className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main">Cập nhật ảnh đại diện</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Modal */}
                <form onSubmit={handleSubmit} className="relative p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Review Avatar */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-primary-light flex items-center justify-center shrink-0 shadow-inner">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-primary" />
                            )}
                        </div>

                        {/* Custom Input File */}
                        <div className="flex-1 space-y-2 w-full">
                            <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider">Chọn ảnh từ máy</label>
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
                                className="w-full px-4 py-2.5 border border-surface-border bg-surface-bg hover:bg-primary-light/30 hover:border-primary/50 text-text-main text-xs font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5"
                            >
                                <Upload className="w-4 h-4 text-primary" />
                                {selectedFile ? selectedFile.name : "Tải lên tệp..."}
                            </button>
                            <p className="text-[11px] text-text-muted text-center sm:text-left">
                                Hỗ trợ SVG, PNG, JPG hoặc GIF (Tối đa 5MB).
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-2xl border border-surface-border bg-surface-bg hover:bg-surface-hover text-text-sub text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || isSubmitting}
                            className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-brand-sm hover:shadow-brand-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            Cập nhật ảnh
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}