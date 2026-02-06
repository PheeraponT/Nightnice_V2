'use client';

import { StarRating } from './StarRating';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  totalRating5: number;
  totalRating4: number;
  totalRating3: number;
  totalRating2: number;
  totalRating1: number;
}

interface ReviewStatsProps {
  stats: ReviewStats;
  onFilterByRating?: (rating: number) => void;
  className?: string;
}

export function ReviewStats({ stats, onFilterByRating, className = '' }: ReviewStatsProps) {
  const {
    averageRating = 0,
    totalReviews = 0,
    totalRating5 = 0,
    totalRating4 = 0,
    totalRating3 = 0,
    totalRating2 = 0,
    totalRating1 = 0,
  } = stats || {};

  if (totalReviews === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-muted">ยังไม่มีรีวิว</p>
      </div>
    );
  }

  const ratingBars = [
    { rating: 5, count: totalRating5 },
    { rating: 4, count: totalRating4 },
    { rating: 3, count: totalRating3 },
    { rating: 2, count: totalRating2 },
    { rating: 1, count: totalRating1 },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Left: Average Rating - Compact */}
      <div className="text-center flex-shrink-0">
        <div className="text-3xl font-bold text-surface-light leading-none">
          {averageRating.toFixed(1)}
        </div>
        <StarRating rating={averageRating} readonly size="sm" />
        <p className="text-[11px] text-muted mt-1">
          {totalReviews} รีวิว
        </p>
      </div>

      {/* Right: Rating Bars - Compact */}
      <div className="flex-1 space-y-1">
        {ratingBars.map(({ rating, count }) => {
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          const isClickable = !!onFilterByRating && count > 0;

          return (
            <button
              key={rating}
              onClick={() => isClickable && onFilterByRating(rating)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-2 group ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="text-[10px] text-muted w-3">{rating}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted w-6 text-right">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
