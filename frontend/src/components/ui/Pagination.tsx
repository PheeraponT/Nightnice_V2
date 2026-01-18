"use client";

import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }

    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="ไปหน้าแรก"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="หน้าก่อนหน้า"
      >
        <svg
          className="w-4 h-4"
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
      </Button>

      {visiblePages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-muted"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "primary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`หน้า ${page}`}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="หน้าถัดไป"
      >
        <svg
          className="w-4 h-4"
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
      </Button>

      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="ไปหน้าสุดท้าย"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </Button>
      )}
    </nav>
  );
}

export { Pagination };
