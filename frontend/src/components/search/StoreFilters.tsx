"use client";

import { useCallback, type ChangeEvent } from "react";
import { Select } from "@/components/ui/Select";
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

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3",
        className
      )}
    >
      <Select
        options={provinceOptions}
        value={selectedProvince || ""}
        onChange={handleProvinceChange}
        placeholder="เลือกจังหวัด"
        className="w-full sm:flex-1"
        disabled={isLoading}
      />

      <Select
        options={categoryOptions}
        value={selectedCategory || ""}
        onChange={handleCategoryChange}
        placeholder="เลือกประเภท"
        className="w-full sm:flex-1"
        disabled={isLoading}
      />

      <Select
        options={priceOptions}
        value={currentPriceValue}
        onChange={handlePriceChange}
        placeholder="เลือกราคา"
        className="w-full sm:flex-1"
        disabled={isLoading}
      />

      {/* Active Filters Count */}
      {(selectedProvince || selectedCategory || selectedMinPrice !== undefined) && (
        <button
          onClick={() => {
            onProvinceChange(undefined);
            onCategoryChange(undefined);
            onPriceChange(undefined, undefined);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-surface-light transition-colors"
          disabled={isLoading}
        >
          <ClearIcon className="w-4 h-4" />
          <span>ล้างตัวกรอง</span>
        </button>
      )}
    </div>
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
