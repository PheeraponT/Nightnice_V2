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
  ownerReply?: string | null;
  ownerReplyAt?: string | null;
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
  { value: 'helpful', label: 'เป็นประโยชน์' },
  { value: 'rating_high', label: 'คะแนนสูง' },
  { value: 'rating_low', label: 'คะแนนต่ำ' },
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
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-night-lighter/60 rounded-xl p-3 border border-white/10 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-white/10 rounded mb-1" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-white/10 rounded mb-1" />
              <div className="h-3 w-3/4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-muted">ยังไม่มีรีวิว</p>
        <p className="text-xs text-muted/70 mt-1">เป็นคนแรกที่แชร์ประสบการณ์</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header: Sort - Compact */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-surface-light">
          รีวิว ({reviews.length})
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-surface-light focus:outline-none focus:border-primary/50"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Review Cards - Compact spacing */}
      <div className="space-y-3 mb-4">
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

      {/* Pagination - Compact */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 bg-white/5 border border-white/10 rounded text-muted hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-white/5 border border-white/10 text-muted hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 bg-white/5 border border-white/10 rounded text-muted hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
