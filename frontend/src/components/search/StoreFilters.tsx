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
      <div className="flex flex-wrap gap-2">
        {/* Province Filter */}
        <div className="relative">
          <select
            value={selectedProvince || ""}
            onChange={handleProvinceChange}
            disabled={isLoading}
            className={cn(
              "appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium cursor-pointer",
              "bg-night-lighter border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              selectedProvince
                ? "border-primary/50 text-primary-light bg-primary/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20"
            )}
          >
            {provinceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            disabled={isLoading}
            className={cn(
              "appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium cursor-pointer",
              "bg-night-lighter border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              selectedCategory
                ? "border-accent/50 text-accent-light bg-accent/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20"
            )}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted" />
        </div>

        {/* Price Filter */}
        <div className="relative">
          <select
            value={currentPriceValue}
            onChange={handlePriceChange}
            disabled={isLoading}
            className={cn(
              "appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium cursor-pointer",
              "bg-night-lighter border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              currentPriceValue
                ? "border-gold/50 text-gold bg-gold/10"
                : "border-white/10 text-muted hover:text-surface-light hover:border-white/20"
            )}
          >
            {priceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-night text-surface-light">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted" />
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-error/80 hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all duration-200"
          >
            <ClearIcon className="w-3.5 h-3.5" />
            <span>ล้าง</span>
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
