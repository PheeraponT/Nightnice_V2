'use client';

import { useState } from 'react';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useStoreReviews, useReviewStats, useCreateReview, useUpdateReview, useDeleteReview, useToggleHelpful, useReportReview } from '@/hooks/useReviews';

interface StoreReviewsProps {
  storeId: string;
}

export function StoreReviews({ storeId }: StoreReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);

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
    // TODO: Implement edit modal
    console.log('Edit review:', reviewId);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?')) {
      try {
        await deleteReview.mutateAsync({ reviewId, storeId });
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง');
      }
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
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted">ไม่พบข้อมูลรีวิว</p>
          </div>
        )}
      </div>

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
