'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { StarRating } from './StarRating';

interface ReviewUser {
  displayName: string;
  photoUrl?: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  user: ReviewUser;
  userId: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  isLoadingHelpful?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  onHelpful,
  onReport,
  onEdit,
  onDelete,
  isLoadingHelpful = false,
  className = '',
}: ReviewCardProps) {
  const { user } = useFirebaseAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isOwner = user && review.userId === user.uid;
  const isEdited = new Date(review.updatedAt) > new Date(review.createdAt);
  const createdDate = new Date(review.createdAt);
  const shouldTruncate = review.content.length > 300;
  const displayContent = isExpanded || !shouldTruncate
    ? review.content
    : review.content.slice(0, 300) + '...';

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'เมื่อสักครู่' : `${diffMinutes} นาทีที่แล้ว`;
      }
      return `${diffHours} ชั่วโมงที่แล้ว`;
    }
    if (diffDays === 1) return 'เมื่อวาน';
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
    return `${Math.floor(diffDays / 365)} ปีที่แล้ว`;
  };

  return (
    <div
      className={`bg-night-lighter/60 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 ${className}`}
      style={{
        boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.03)',
      }}
    >
      {/* Header: User Info & Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0"
            style={{
              boxShadow: '0 0 10px rgba(103, 41, 255, 0.2)',
            }}
          >
            {review.user.photoUrl ? (
              <img
                src={review.user.photoUrl}
                alt={review.user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg">
                {review.user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Name & Date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-surface-light truncate">
                {review.user.displayName}
              </h4>
              {isEdited && (
                <span
                  className="px-2 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-muted"
                  title="แก้ไขแล้ว"
                >
                  แก้ไข
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">
              {formatDate(createdDate)}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        {(isOwner || user) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
              aria-label="เมนู"
            >
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Dropdown Menu */}
                <div
                  className="absolute right-0 top-full mt-2 w-48 py-2 bg-night-lighter/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl z-20"
                  style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(103, 41, 255, 0.2)',
                  }}
                >
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          onEdit?.(review.id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-surface-light hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        แก้ไขรีวิว
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(review.id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ลบรีวิว
                      </button>
                    </>
                  )}
                  {!isOwner && user && (
                    <button
                      onClick={() => {
                        onReport?.(review.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-surface-light hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      รายงานรีวิว
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-surface-light mb-2">
          {review.title}
        </h5>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm text-muted/90 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
          >
            {isExpanded ? 'แสดงน้อยลง' : 'อ่านเพิ่มเติม'}
          </button>
        )}
      </div>

      {/* Footer: Helpful Button */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <button
          onClick={() => user && onHelpful?.(review.id)}
          disabled={!user || isLoadingHelpful}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
            review.isHelpfulByCurrentUser
              ? 'bg-primary/20 border border-primary/30'
              : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
          } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={!user ? 'เข้าสู่ระบบเพื่อโหวต' : undefined}
        >
          <svg
            className={`w-4 h-4 transition-all duration-200 ${
              review.isHelpfulByCurrentUser
                ? 'text-primary'
                : 'text-muted group-hover:text-surface-light'
            } ${isLoadingHelpful ? 'animate-pulse' : ''}`}
            fill={review.isHelpfulByCurrentUser ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={review.isHelpfulByCurrentUser ? 0 : 2}
            viewBox="0 0 24 24"
            style={{
              filter: review.isHelpfulByCurrentUser
                ? 'drop-shadow(0 0 4px rgba(235, 16, 70, 0.5))'
                : undefined,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span
            className={`text-sm font-medium ${
              review.isHelpfulByCurrentUser ? 'text-primary' : 'text-muted group-hover:text-surface-light'
            }`}
          >
            เป็นประโยชน์ {review.helpfulCount > 0 && `(${review.helpfulCount})`}
          </span>
        </button>
      </div>
    </div>
  );
}
