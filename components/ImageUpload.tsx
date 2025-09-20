"use client";
import { useCallback, useState, useRef } from "react";
import Image from "next/image";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeBytes?: number;
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 2MB for base64
const MAX_IMAGES = 4;

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = MAX_IMAGES,
  maxSizeBytes = MAX_SIZE_BYTES,
  disabled = false,
  isOpen = true,
  onToggle,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return `Unsupported format. Please use: ${SUPPORTED_FORMATS.map(
        (f) => f.split("/")[1]
      ).join(", ")}`;
    }
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${Math.round(
        maxSizeBytes / (1024 * 1024)
      )}MB`;
    }
    return null;
  };

  const processFile = async (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const preview = URL.createObjectURL(file);
        resolve({
          id: Math.random().toString(36).substring(2, 11),
          file,
          preview,
          base64,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled) return;

      setError(null);
      const fileArray = Array.from(files);

      if (images.length + fileArray.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        validFiles.push(file);
      }

      try {
        const newImages = await Promise.all(validFiles.map(processFile));
        onImagesChange([...images, ...newImages]);
      } catch (err) {
        setError("Failed to process images");
      }
    },
    [images, onImagesChange, maxImages, maxSizeBytes, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      // Clean up preview URLs
      const removedImage = images.find((img) => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="animate-in slide-in-from-top-2 duration-300">
      {/* Upload Area with Integrated Images */}
      <div
        className={`
          border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
          ${
            isDragging
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[1.02]"
              : "border-neutral-300 dark:border-neutral-600 hover:border-orange-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${images.length > 0 ? "p-4" : "p-6"}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={SUPPORTED_FORMATS.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {/* Image Grid or Upload Prompt */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group animate-in zoom-in-50 duration-300 h-32 ${
                  index === 0
                    ? "delay-0"
                    : index === 1
                    ? "delay-75"
                    : index === 2
                    ? "delay-150"
                    : "delay-300"
                }`}
              >
                <Image
                  src={image.preview}
                  alt={image.file.name}
                  fill
                  className="rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:saturate-150 group-hover:brightness-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg z-10"
                  title="Remove image"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] p-2 rounded-b-lg truncate">
                  {image.file.name}
                </div>
              </div>
            ))}

            {/* Add More Button */}
            {images.length < maxImages && (
              <div className="flex items-center justify-center border-dashed border-neutral-300 dark:border-neutral-600/40 rounded-lg hover:border-orange-400 transition-colors duration-200">
                <div className="text-center">
                  <span className="text-2xl mb-1 block">+</span>
                  <span className="text-xs text-neutral-500">Add more</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <div className="mb-3">
              <span className="text-3xl">📷</span>
            </div>
            <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">
              Add images
            </p>
            <p className="text-xs mb-1">
              Click, drag & drop, or paste images here
            </p>
            <p className="text-xs text-neutral-500">
              Max {maxImages} images, {Math.round(maxSizeBytes / (1024 * 1024))}
              MB each
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 animate-in slide-in-from-top-1 duration-200 mt-3">
          {error}
        </div>
      )}
    </div>
  );
}
