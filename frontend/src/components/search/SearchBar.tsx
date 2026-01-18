"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "ค้นหาร้าน...",
  className,
  debounceMs = 300,
  autoFocus = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the onChange callback
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Clear debounce and trigger immediate update
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      onChange(localValue);
      onSearch?.(localValue);
    },
    [localValue, onChange, onSearch]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="w-5 h-5 text-muted" />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-12 py-3",
          "bg-dark-lighter border border-muted/30",
          "rounded-xl text-surface-light placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
          "transition-all duration-200"
        )}
        data-event="search"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-12 flex items-center px-2 text-muted hover:text-surface-light transition-colors"
          aria-label="ล้างการค้นหา"
        >
          <ClearIcon className="w-5 h-5" />
        </button>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="absolute inset-y-0 right-0 px-4 flex items-center text-primary hover:text-primary/80 transition-colors"
        aria-label="ค้นหา"
      >
        <ArrowRightIcon className="w-5 h-5" />
      </button>
    </form>
  );
}

// Compact version for header
export function SearchBarCompact({
  value = "",
  onChange,
  onSearch,
  placeholder = "ค้นหา...",
  className,
}: Omit<SearchBarProps, "debounceMs" | "autoFocus">) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onChange(localValue);
      onSearch?.(localValue);
    },
    [localValue, onChange, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="w-4 h-4 text-muted" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-9 pr-3 py-2 text-sm",
          "bg-dark border border-muted/30",
          "rounded-lg text-surface-light placeholder:text-muted",
          "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50",
          "transition-all duration-200"
        )}
      />
    </form>
  );
}

// Icon components
function SearchIcon({ className }: { className?: string }) {
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
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

function ArrowRightIcon({ className }: { className?: string }) {
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
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}
