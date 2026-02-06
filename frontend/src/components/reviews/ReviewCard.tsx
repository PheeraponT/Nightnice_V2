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
  ownerReply?: string | null;
  ownerReplyAt?: string | null;
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
  const shouldTruncate = review.content.length > 150;
  const displayContent = isExpanded || !shouldTruncate
    ? review.content
    : review.content.slice(0, 150) + '...';

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) return 'เมื่อสักครู่';
      return `${diffHours}ชม.`;
    }
    if (diffDays < 7) return `${diffDays}วัน`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}สัปดาห์`;
    return `${Math.floor(diffDays / 30)}เดือน`;
  };

  return (
    <div className={`bg-night-lighter/60 rounded-xl p-3 border border-white/10 hover:border-white/15 transition-colors ${className}`}>
      {/* Header: Avatar + Name + Rating + Actions - All in one row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Avatar - Smaller */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
          {review.user.photoUrl ? (
            <img
              src={review.user.photoUrl}
              alt={review.user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium text-xs">
              {review.user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name & Date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-surface-light truncate">
              {review.user.displayName}
            </span>
            {isEdited && (
              <span className="text-[10px] text-muted">(แก้ไข)</span>
            )}
          </div>
          <p className="text-[11px] text-muted">{formatDate(createdDate)}</p>
        </div>

        {/* Rating - Inline */}
        <StarRating rating={review.rating} readonly size="sm" />

        {/* Actions Menu */}
        {(isOwner || user) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              aria-label="เมนู"
            >
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-night-lighter/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-20">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => { onEdit?.(review.id); setShowActions(false); }}
                        className="w-full px-3 py-1.5 text-left text-xs text-surface-light hover:bg-white/10 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={() => { onDelete?.(review.id); setShowActions(false); }}
                        className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ลบ
                      </button>
                    </>
                  )}
                  {!isOwner && user && (
                    <button
                      onClick={() => { onReport?.(review.id); setShowActions(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs text-surface-light hover:bg-white/10 flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                      </svg>
                      รายงาน
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-medium text-sm text-surface-light mb-1">{review.title}</h5>
      )}

      {/* Content - Compact */}
      <p className="text-xs text-muted/90 leading-relaxed whitespace-pre-wrap">
        {displayContent}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 text-primary hover:text-primary/80 font-medium"
          >
            {isExpanded ? 'ย่อ' : 'เพิ่ม'}
          </button>
        )}
      </p>

      {/* Owner Reply */}
      {review.ownerReply && (
        <div className="mt-2 ml-4 pl-3 border-l-2 border-accent/40 bg-accent/5 rounded-r-lg py-2 pr-3">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-[11px] font-semibold text-accent-light">ตอบจากเจ้าของร้าน</span>
            {review.ownerReplyAt && (
              <span className="text-[10px] text-muted">
                {formatDate(new Date(review.ownerReplyAt))}
              </span>
            )}
          </div>
          <p className="text-xs text-muted/90 leading-relaxed whitespace-pre-wrap">
            {review.ownerReply}
          </p>
        </div>
      )}

      {/* Footer: Helpful - Compact */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
        <button
          onClick={() => user && onHelpful?.(review.id)}
          disabled={!user || isLoadingHelpful}
          className={`flex items-center gap-1 text-[11px] transition-colors ${
            review.isHelpfulByCurrentUser
              ? 'text-primary'
              : 'text-muted hover:text-surface-light'
          } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoadingHelpful ? 'animate-pulse' : ''}`}
            fill={review.isHelpfulByCurrentUser ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={review.isHelpfulByCurrentUser ? 0 : 2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {review.helpfulCount > 0 ? review.helpfulCount : 'เป็นประโยชน์'}
        </button>
      </div>
    </div>
  );
}
