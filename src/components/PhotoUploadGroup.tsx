"use client";

import React, { useState } from "react";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadGroupProps {
  onImagesChange: (urls: {
    coverImage: string | null;
    supportingImage1: string | null;
    supportingImage2: string | null;
  }) => void;
  required?: boolean;
}

export default function PhotoUploadGroup({ onImagesChange, required = true }: PhotoUploadGroupProps) {
  const [images, setImages] = useState<{
    coverImage: string | null;
    supportingImage1: string | null;
    supportingImage2: string | null;
  }>({
    coverImage: null,
    supportingImage1: null,
    supportingImage2: null,
  });

  const [loadingStates, setLoadingStates] = useState<{
    coverImage: boolean;
    supportingImage1: boolean;
    supportingImage2: boolean;
  }>({
    coverImage: false,
    supportingImage1: false,
    supportingImage2: false,
  });

  const [errors, setErrors] = useState<{
    coverImage: string | null;
    supportingImage1: string | null;
    supportingImage2: string | null;
  }>({
    coverImage: null,
    supportingImage1: null,
    supportingImage2: null,
  });

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "coverImage" | "supportingImage1" | "supportingImage2"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [key]: "Please select a valid image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: "Image size should be less than 5MB." }));
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: null }));

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload image.");
      }

      const data = await res.json();
      const updatedImages = { ...images, [key]: data.url };
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [key]: err.message || "Failed to upload image." }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
      e.target.value = ""; // Clear input
    }
  };

  const handleRemove = (key: "coverImage" | "supportingImage1" | "supportingImage2") => {
    const updatedImages = { ...images, [key]: null };
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const renderUploadBox = (
    key: "coverImage" | "supportingImage1" | "supportingImage2",
    label: string,
    isRequired: boolean
  ) => {
    const url = images[key];
    const isLoading = loadingStates[key];
    const error = errors[key];

    return (
      <div className="flex flex-col gap-2 flex-1">
        <label className="text-[10px] uppercase font-bold text-slate-500 font-metadata">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>

        {url ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-navy-deep/40 aspect-video flex items-center justify-center group">
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-navy-deep/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRemove(key)}
                className="p-2 rounded-full bg-red-500/25 border border-red-500/50 hover:bg-red-500/40 text-red-400 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-700/80 rounded-2xl p-6 flex flex-col items-center justify-center bg-navy-deep/30 hover:bg-navy-deep/50 transition-colors cursor-pointer group relative aspect-video">
            <input
              type="file"
              accept="image/*"
              disabled={isLoading}
              onChange={(e) => handleUpload(e, key)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-electric-blue animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-electric-blue mb-2 transition-colors" />
                <span className="text-xs text-slate-300 font-bold text-center">
                  Click to upload
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-body">Max 5MB</span>
              </>
            )}
          </label>
        )}

        {error && (
          <p className="text-red-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4 text-electric-blue" />
        <h3 className="font-metadata text-xs font-bold text-slate-400 uppercase tracking-widest">
          Media & Documentation
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {renderUploadBox("coverImage", "Cover Photo", required)}
        {renderUploadBox("supportingImage1", "Supporting Photo 1", false)}
        {renderUploadBox("supportingImage2", "Supporting Photo 2", false)}
      </div>
      <p className="text-[10px] text-slate-500 italic">
        Please upload one cover photo (required) and up to two supporting photos for documentation. Max size 5MB per image.
      </p>
    </div>
  );
}
