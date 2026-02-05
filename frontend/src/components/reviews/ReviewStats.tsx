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
      <div className={`text-center py-8 ${className}`}>
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4"
          style={{
            boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
          }}
        >
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
        <p className="text-muted">ยังไม่มีรีวิว</p>
        <p className="text-sm text-muted/70 mt-1">เป็นคนแรกที่แชร์ประสบการณ์ของคุณ</p>
      </div>
    );
  }

  const ratingBars = [
    { rating: 5, count: totalRating5, label: '5 ดาว' },
    { rating: 4, count: totalRating4, label: '4 ดาว' },
    { rating: 3, count: totalRating3, label: '3 ดาว' },
    { rating: 2, count: totalRating2, label: '2 ดาว' },
    { rating: 1, count: totalRating1, label: '1 ดาว' },
  ];

  return (
    <div className={className}>
      {/* Overall Rating Display */}
      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
        {/* Large Rating Number */}
        <div className="text-center">
          <div
            className="text-5xl font-bold text-surface-light mb-2"
            style={{
              textShadow: '0 0 20px rgba(235, 16, 70, 0.3)',
            }}
          >
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} readonly size="md" />
          <p className="text-sm text-muted mt-2">
            จาก {totalReviews.toLocaleString()} รีวิว
          </p>
        </div>

        {/* Rating Bars */}
        <div className="flex-1">
          {ratingBars.map(({ rating, count, label }) => {
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isClickable = !!onFilterByRating && count > 0;

            return (
              <button
                key={rating}
                onClick={() => isClickable && onFilterByRating(rating)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 mb-2 group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Rating Label */}
                <span className="text-sm text-muted w-12 text-right flex-shrink-0">
                  {label}
                </span>

                {/* Progress Bar */}
                <div
                  className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 relative"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isClickable ? 'group-hover:opacity-90' : ''
                    }`}
                    style={{
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, #EB1046 0%, #6729FF 100%)',
                      boxShadow: percentage > 0 ? '0 0 10px rgba(235, 16, 70, 0.5)' : 'none',
                    }}
                  />
                </div>

                {/* Count */}
                <span
                  className={`text-sm w-12 text-right flex-shrink-0 ${
                    count > 0 ? 'text-surface-light font-medium' : 'text-muted/50'
                  }`}
                >
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distribution Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-surface-light mb-1">
            {totalRating5 + totalRating4}
          </div>
          <div className="text-xs text-muted">รีวิวเชิงบวก</div>
          <div className="text-xs text-primary mt-1">
            {totalReviews > 0 ? Math.round(((totalRating5 + totalRating4) / totalReviews) * 100) : 0}%
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-surface-light mb-1">
            {totalRating3}
          </div>
          <div className="text-xs text-muted">รีวิวปานกลาง</div>
          <div className="text-xs text-muted mt-1">
            {totalReviews > 0 ? Math.round((totalRating3 / totalReviews) * 100) : 0}%
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-surface-light mb-1">
            {totalRating2 + totalRating1}
          </div>
          <div className="text-xs text-muted">รีวิวเชิงลบ</div>
          <div className="text-xs text-red-400 mt-1">
            {totalReviews > 0 ? Math.round(((totalRating2 + totalRating1) / totalReviews) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
