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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-surface-card w-full max-w-md rounded-2xl border border-surface-border shadow-brand-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                    <h3 className="text-lg font-bold text-text-main">Cập nhật Avatar</h3>
                    <button
                        onClick={handleClose}
                        className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Modal */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex items-center gap-5">
                        {/* Review Avatar */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-surface-border bg-primary-light flex items-center justify-center shrink-0">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-primary" />
                            )}
                        </div>

                        {/* Custom Input File */}
                        <div className="flex-1 space-y-1.5">
                            <label className="block text-xs font-semibold text-text-sub">Upload avatar</label>
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
                                className="w-full px-3.5 py-2 border border-surface-border hover:bg-surface-hover text-text-main text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4 text-primary" />
                                {selectedFile ? selectedFile.name : "Chọn tệp từ máy..."}
                            </button>
                            <p className="text-[11px] text-text-muted">
                                Hỗ trợ SVG, PNG, JPG hoặc GIF (Tối đa 5MB).
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl border border-surface-border text-text-sub hover:bg-surface-hover text-sm font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-contrast text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-brand-sm disabled:opacity-50"
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