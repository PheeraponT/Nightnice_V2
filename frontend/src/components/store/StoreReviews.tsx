'use client';

import { useState } from 'react';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StarRating } from '@/components/reviews/StarRating';
import { useStoreReviews, useReviewStats, useCreateReview, useUpdateReview, useDeleteReview, useToggleHelpful, useReportReview } from '@/hooks/useReviews';
import { useToast } from '@/components/ui/Toast';

interface StoreReviewsProps {
  storeId: string;
}

export function StoreReviews({ storeId }: StoreReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const { showToast } = useToast();

  // Queries
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useReviewStats(storeId);
  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useStoreReviews(storeId, currentPage, 10, sortBy);

  // Debug logging
  console.log('StoreReviews Debug:', {
    storeId,
    statsData,
    reviewsData,
    isLoadingReviews,
    reviewsError,
  });

  // Mutations
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const toggleHelpful = useToggleHelpful();
  const reportReview = useReportReview();

  const handleCreateReview = async () => {
    // Refetch will happen automatically via query invalidation
    setCurrentPage(1); // Reset to first page
  };

  const handleToggleHelpful = async (reviewId: string) => {
    await toggleHelpful.mutateAsync({ reviewId, storeId });
  };

  const handleReport = (reviewId: string) => {
    setReportReviewId(reviewId);
    setShowReportModal(true);
  };

  const handleEdit = (reviewId: string) => {
    const review = reviewsData?.items?.find((r) => r.id === reviewId);
    if (!review) return;
    setEditRating(review.rating);
    setEditTitle(review.title ?? '');
    setEditContent(review.content);
    setEditingReviewId(reviewId);
  };

  const handleSubmitEdit = async () => {
    if (!editingReviewId) return;
    if (editRating === 0) {
      showToast('กรุณาเลือกคะแนน', 'warning');
      return;
    }
    if (editContent.trim().length < 10) {
      showToast('รีวิวต้องมีอย่างน้อย 10 ตัวอักษร', 'warning');
      return;
    }
    try {
      await updateReview.mutateAsync({
        reviewId: editingReviewId,
        data: {
          rating: editRating,
          title: editTitle.trim() || undefined,
          content: editContent.trim(),
        },
      });
      setEditingReviewId(null);
      showToast('แก้ไขรีวิวเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Failed to update review:', error);
      showToast('ไม่สามารถแก้ไขรีวิวได้ กรุณาลองใหม่', 'error');
    }
  };

  const handleRequestDelete = (reviewId: string) => {
    setDeletingReviewId(reviewId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;
    try {
      await deleteReview.mutateAsync({ reviewId: deletingReviewId, storeId });
      setDeletingReviewId(null);
      showToast('ลบรีวิวเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Failed to delete review:', error);
      showToast('ไม่สามารถลบรีวิวได้ กรุณาลองใหม่', 'error');
    }
  };

  const handleSubmitReport = async (reason: string, description?: string) => {
    if (!reportReviewId) return;

    try {
      await reportReview.mutateAsync({
        reviewId: reportReviewId,
        reason: reason as any,
        description,
      });
      setShowReportModal(false);
      setReportReviewId(null);
      alert('รายงานรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับการแจ้ง');
    } catch (error) {
      console.error('Failed to report review:', error);
      alert('ไม่สามารถรายงานรีวิวได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <>
      {/* Reviews Section */}
      <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
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
          <h2 className="text-lg font-display font-semibold text-surface-light">
            รีวิว
          </h2>
        </div>

        {/* Review Stats */}
        {isLoadingStats ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(235, 16, 70, 0.5))',
              }}
            />
          </div>
        ) : statsData ? (
          <ReviewStats stats={statsData} className="mb-8" />
        ) : null}

        {/* Review Form */}
        <div className="mb-8">
          <ReviewForm storeId={storeId} onSuccess={handleCreateReview} />
        </div>

        {/* Review List */}
        {isLoadingReviews ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(235, 16, 70, 0.5))',
              }}
            />
          </div>
        ) : reviewsError ? (
          <div className="text-center py-8">
            <p className="text-red-400">เกิดข้อผิดพลาดในการโหลดรีวิว</p>
            <p className="text-sm text-muted mt-2">{reviewsError.message}</p>
          </div>
        ) : reviewsData ? (
          <ReviewList
            storeId={storeId}
            reviews={reviewsData.items || []}
            currentPage={currentPage}
            totalPages={reviewsData.totalPages || 1}
            sortBy={sortBy}
            onPageChange={setCurrentPage}
            onSortChange={setSortBy}
            onHelpful={handleToggleHelpful}
            onReport={handleReport}
            onEdit={handleEdit}
            onDelete={handleRequestDelete}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted">ไม่พบข้อมูลรีวิว</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingReviewId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeletingReviewId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-night-lighter/95 p-6 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-surface-light">ลบรีวิวนี้?</h3>
            <p className="text-xs text-muted leading-relaxed">
              รีวิวที่ถูกลบจะไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeletingReviewId(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-surface-light hover:bg-white/10 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteReview.isPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteReview.isPending ? 'กำลังลบ...' : 'ลบรีวิว'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReviewId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingReviewId(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-night-lighter/95 p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-surface-light">แก้ไขรีวิว</h3>
              <button
                type="button"
                onClick={() => setEditingReviewId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-surface-light transition-colors"
                aria-label="ปิด"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-surface-light mb-2">
                คะแนน <span className="text-red-400">*</span>
              </label>
              <StarRating rating={editRating} onRatingChange={setEditRating} size="lg" />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-surface-light mb-2">
                หัวข้อ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={200}
                placeholder="สรุปประสบการณ์ของคุณ"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-surface-light placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="mt-1 text-right text-[11px] text-muted">{editTitle.length}/200</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-surface-light mb-2">
                รีวิว <span className="text-red-400">*</span>
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="แชร์ประสบการณ์ของคุณ (อย่างน้อย 10 ตัวอักษร)"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-surface-light placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <p className={`mt-1 text-right text-[11px] ${editContent.length < 10 ? 'text-red-400' : 'text-muted'}`}>
                {editContent.length}/2000
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEditingReviewId(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-surface-light hover:bg-white/10 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSubmitEdit}
                disabled={updateReview.isPending}
                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent py-2.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {updateReview.isPending ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal (Simple implementation) */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-night-lighter border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(103, 41, 255, 0.3)',
            }}
          >
            <h3 className="text-xl font-display font-semibold text-surface-light mb-4">
              รายงานรีวิว
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reason = formData.get('reason') as string;
                const description = formData.get('description') as string;
                handleSubmitReport(reason, description);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-light mb-2">
                  เหตุผล
                </label>
                <select
                  name="reason"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-surface-light focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="spam">สแปม</option>
                  <option value="offensive">เนื้อหาไม่เหมาะสม</option>
                  <option value="fake">รีวิวปลอม</option>
                  <option value="inappropriate">ไม่เกี่ยวข้อง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-surface-light mb-2">
                  รายละเอียดเพิ่มเติม (ไม่บังคับ)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-surface-light focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="อธิบายปัญหาที่พบ..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-surface-light hover:bg-white/10 transition-all duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={reportReview.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent rounded-xl font-medium text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportReview.isPending ? 'กำลังส่ง...' : 'ส่งรายงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
