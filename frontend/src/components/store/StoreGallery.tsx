"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { StoreImageDto } from "@/lib/api";

interface StoreGalleryProps {
  images: StoreImageDto[];
  storeName: string;
  className?: string;
}

export function StoreGallery({
  images,
  storeName,
  className,
}: StoreGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setIsLightboxOpen(false);
    },
    [handlePrevious, handleNext]
  );

  if (images.length === 0) {
    return null;
  }

  const selectedImage = images[selectedIndex];

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Main Image */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={resolveImageUrl(selectedImage.imageUrl) || ""}
            alt={selectedImage.altText || `${storeName} - รูปที่ ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            priority={selectedIndex === 0}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
              คลิกเพื่อขยาย
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200",
                  index === selectedIndex
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-dark"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={resolveImageUrl(image.imageUrl) || ""}
                  alt={image.altText || `${storeName} - รูปที่ ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="ปิด"
          >
            <CloseIcon className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="รูปถัดไป"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resolveImageUrl(selectedImage.imageUrl) || ""}
              alt={selectedImage.altText || `${storeName} - รูปที่ ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

// Icon components
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
