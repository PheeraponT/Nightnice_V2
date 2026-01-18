"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
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
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, placeholder, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-surface-light mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            className={cn(
              "w-full px-4 py-2.5 rounded-button appearance-none",
              "bg-dark text-surface-light",
              "border-2 border-muted/30",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "pr-10",
              error && "border-error focus:border-error focus:ring-error/50",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-muted"
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
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
