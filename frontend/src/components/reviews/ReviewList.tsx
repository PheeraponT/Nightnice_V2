'use client';

import { useState } from 'react';
import { ReviewCard } from './ReviewCard';

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  user: {
    displayName: string;
    photoUrl?: string;
  };
  userId: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListProps {
  storeId: string;
  reviews: Review[];
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string) => void;
  onHelpful: (reviewId: string) => void;
  onReport: (reviewId: string) => void;
  onEdit: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
  sortBy?: string;
  className?: string;
}

const sortOptions = [
  { value: 'recent', label: 'ล่าสุด' },
  { value: 'helpful', label: 'เป็นประโยชน์มากที่สุด' },
  { value: 'rating_high', label: 'คะแนนสูงสุด' },
  { value: 'rating_low', label: 'คะแนนต่ำสุด' },
];

export function ReviewList({
  reviews,
  currentPage,
  totalPages,
  isLoading = false,
  onPageChange,
  onSortChange,
  onHelpful,
  onReport,
  onEdit,
  onDelete,
  sortBy = 'recent',
  className = '',
}: ReviewListProps) {
  const [helpfulLoadingId, setHelpfulLoadingId] = useState<string | null>(null);

  const handleHelpful = async (reviewId: string) => {
    setHelpfulLoadingId(reviewId);
    try {
      await onHelpful(reviewId);
    } finally {
      setHelpfulLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {/* Sort Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Review Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-night-lighter/60 backdrop-blur-sm rounded-xl p-5 border border-white/10 animate-pulse"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4"
          style={{
            boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
          }}
        >
          <svg
            className="w-10 h-10 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-surface-light mb-2">
          ยังไม่มีรีวิว
        </h3>
        <p className="text-sm text-muted">
          เป็นคนแรกที่แชร์ประสบการณ์ของคุณ
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header: Title & Sort */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-surface-light">
          รีวิวทั้งหมด ({reviews.length})
        </h3>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-sm text-surface-light focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-muted"
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
      </div>

      {/* Review Cards */}
      <div className="space-y-4 mb-8">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onHelpful={handleHelpful}
            onReport={onReport}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoadingHelpful={helpfulLoadingId === review.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-surface-light hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
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
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show only nearby pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'bg-white/5 border border-white/10 text-surface-light hover:bg-white/10 hover:border-white/20'
                    }`}
                    style={
                      page === currentPage
                        ? {
                            boxShadow: '0 0 20px rgba(235, 16, 70, 0.5)',
                          }
                        : undefined
                    }
                  >
                    {page}
                  </button>
                );
              }

              // Show ellipsis
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-muted px-2">
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-surface-light hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      )}
    </div>
  );
}
