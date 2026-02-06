"use client";

import { useCallback, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import type { ProvinceDto, CategoryDto } from "@/lib/api";
import { PRICE_RANGES } from "@/lib/constants";

interface StoreFiltersProps {
  provinces: ProvinceDto[];
  categories: CategoryDto[];
  selectedProvince?: string;
  selectedCategory?: string;
  selectedMinPrice?: number;
  selectedMaxPrice?: number;
  onProvinceChange: (province: string | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  className?: string;
  isLoading?: boolean;
}

export function StoreFilters({
  provinces,
  categories,
  selectedProvince,
  selectedCategory,
  selectedMinPrice,
  selectedMaxPrice,
  onProvinceChange,
  onCategoryChange,
  onPriceChange,
  className,
  isLoading = false,
}: StoreFiltersProps) {
  const provinceOptions = [
    { value: "", label: "ทุกจังหวัด" },
    ...provinces.map((p) => ({
      value: p.slug,
      label: `${p.name} (${p.storeCount})`,
    })),
  ];

  const categoryOptions = [
    { value: "", label: "ทุกประเภท" },
    ...categories.map((c) => ({
      value: c.slug,
      label: `${c.name} (${c.storeCount})`,
    })),
  ];

  const priceOptions = [
    { value: "", label: "ทุกราคา" },
    ...PRICE_RANGES.map((p) => ({
      value: String(p.value),
      label: `${p.label} - ${p.description}`,
    })),
  ];

  const handleProvinceChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onProvinceChange(e.target.value || undefined);
    },
    [onProvinceChange]
  );

  const handleCategoryChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onCategoryChange(e.target.value || undefined);
    },
    [onCategoryChange]
  );

  const handlePriceChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (!value) {
        onPriceChange(undefined, undefined);
      } else {
        const priceValue = parseInt(value, 10);
        onPriceChange(priceValue, priceValue);
      }
    },
    [onPriceChange]
  );

  const currentPriceValue =
    selectedMinPrice !== undefined ? String(selectedMinPrice) : "";

  const hasFilters = selectedProvince || selectedCategory || selectedMinPrice !== undefined;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filter Row */}
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5 items-center">
        {/* Province Filter */}
        <div className="relative col-span-1">
          <MapPinIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
          <select
            value={selectedProvince || ""}
            onChange={handleProvinceChange}
            disabled={isLoading}
            className={cn(
              "w-full appearance-none pl-7 sm:pl-9 pr-7 sm:pr-9 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer truncate",
              "bg-night-lighter/80 backdrop-blur-sm border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
              selectedProvince
                ? "border-primary/40 text-primary-light bg-primary/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20 hover:bg-night-lighter"
            )}
          >
            {provinceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
        </div>

        {/* Category Filter */}
        <div className="relative col-span-1">
          <TagIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
          <select
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            disabled={isLoading}
            className={cn(
              "w-full appearance-none pl-7 sm:pl-9 pr-7 sm:pr-9 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer truncate",
              "bg-night-lighter/80 backdrop-blur-sm border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40",
              selectedCategory
                ? "border-accent/40 text-accent-light bg-accent/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20 hover:bg-night-lighter"
            )}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
        </div>

        {/* Price Filter */}
        <div className="relative col-span-1">
          <PriceIcon className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
          <select
            value={currentPriceValue}
            onChange={handlePriceChange}
            disabled={isLoading}
            className={cn(
              "w-full appearance-none pl-7 sm:pl-9 pr-7 sm:pr-9 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer truncate",
              "bg-night-lighter/80 backdrop-blur-sm border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40",
              currentPriceValue
                ? "border-gold/40 text-gold bg-gold/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20 hover:bg-night-lighter"
            )}
          >
            {priceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none text-muted" />
        </div>

        {/* Clear Button */}
        {hasFilters && (
          <button
            onClick={() => {
              onProvinceChange(undefined);
              onCategoryChange(undefined);
              onPriceChange(undefined, undefined);
            }}
            disabled={isLoading}
            className="col-span-3 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-error/80 hover:text-error hover:bg-error/10 border border-error/20 sm:border-transparent hover:border-error/20 transition-all duration-200"
          >
            <ClearIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function PriceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
