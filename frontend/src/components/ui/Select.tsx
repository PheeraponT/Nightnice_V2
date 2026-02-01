"use client";

import { forwardRef, useState, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
  placeholder?: string;
  variant?: "default" | "glass" | "minimal";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, placeholder, id, variant = "glass", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const variants = {
      default: cn(
        "bg-night-card text-surface-light",
        "border border-muted/20",
        "hover:border-primary/40",
        "focus:border-primary focus:ring-2 focus:ring-primary/20"
      ),
      glass: cn(
        "bg-night-card/80 backdrop-blur-md text-surface-light",
        "border border-white/10",
        "hover:border-primary/50 hover:bg-night-card/90",
        "focus:border-primary focus:ring-2 focus:ring-primary/30",
        "shadow-lg shadow-black/20"
      ),
      minimal: cn(
        "bg-transparent text-surface-light",
        "border-b-2 border-muted/30 rounded-none",
        "hover:border-primary/50",
        "focus:border-primary"
      ),
    };

    return (
      <div className={cn("group", className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              isFocused ? "text-primary-light" : "text-muted"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {/* Glow effect container */}
          <div
            className={cn(
              "absolute -inset-0.5 rounded-button opacity-0 blur-sm transition-opacity duration-300",
              "bg-gradient-to-r from-primary via-accent to-primary",
              isFocused && !error && "opacity-50"
            )}
          />

          <select
            id={id}
            className={cn(
              "relative w-full px-4 py-3 rounded-button appearance-none",
              "focus:outline-none",
              "transition-all duration-300 ease-out",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "pr-12",
              "cursor-pointer",
              "font-medium text-sm",
              variants[variant],
              error && "border-error focus:border-error focus:ring-error/30"
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-muted bg-night-card">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-night-card text-surface-light py-2"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon with animation */}
          <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 pointer-events-none">
            <svg
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isFocused ? "text-primary-light rotate-180" : "text-muted"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-error flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
