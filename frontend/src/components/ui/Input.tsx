"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, id, ...props }, ref) => {
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
        <input
          type={type}
          id={id}
          className={cn(
            "w-full px-4 py-2.5 rounded-button",
            "bg-dark text-surface-light placeholder:text-muted",
            "border-2 border-muted/30",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:border-error focus:ring-error/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
