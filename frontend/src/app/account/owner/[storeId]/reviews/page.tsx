"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  useOwnedStore,
  useRatingAnalytics,
  useReplyToReview,
  useUpdateReviewReply,
  useDeleteReviewReply,
} from "@/hooks/useOwnerDashboard";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function ReviewsManagementPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useFirebaseAuth();
  const { data: store } = useOwnedStore(storeId);
  const { data: ratingData, isLoading } = useRatingAnalytics(storeId);
  const replyMutation = useReplyToReview();
  const updateReplyMutation = useUpdateReviewReply();
  const deleteReplyMutation = useDeleteReviewReply();
  const { showToast } = useToast();

  // Track which review is being replied to / edited
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleStartReply = useCallback((reviewId: string) => {
    setReplyingTo(reviewId);
    setEditingReply(null);
    setReplyText("");
  }, []);

  const handleStartEdit = useCallback((reviewId: string, currentReply: string) => {
    setEditingReply(reviewId);
    setReplyingTo(null);
    setReplyText(currentReply);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  }, []);

  const handleSubmitReply = useCallback(
    async (reviewId: string) => {
      if (!replyText.trim()) {
        showToast("กรุณาเขียนข้อความตอบกลับ", "warning");
        return;
      }

      try {
        await replyMutation.mutateAsync({
          storeId,
          reviewId,
          reply: replyText.trim(),
        });
        showToast("ตอบรีวิวสำเร็จ", "success");
        setReplyingTo(null);
        setReplyText("");
      } catch (error) {
        console.error("Failed to reply:", error);
        showToast("ไม่สามารถตอบรีวิวได้ กรุณาลองอีกครั้ง", "error");
      }
    },
    [replyText, storeId, replyMutation, showToast]
  );

  const handleUpdateReply = useCallback(
    async (reviewId: string) => {
      if (!replyText.trim()) {
        showToast("กรุณาเขียนข้อความตอบกลับ", "warning");
        return;
      }

      try {
        await updateReplyMutation.mutateAsync({
          storeId,
          reviewId,
          reply: replyText.trim(),
        });
        showToast("แก้ไขคำตอบสำเร็จ", "success");
        setEditingReply(null);
        setReplyText("");
      } catch (error) {
        console.error("Failed to update reply:", error);
        showToast("ไม่สามารถแก้ไขคำตอบได้ กรุณาลองอีกครั้ง", "error");
      }
    },
    [replyText, storeId, updateReplyMutation, showToast]
  );

  const handleDeleteReply = useCallback(
    async (reviewId: string) => {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("ยืนยันการลบคำตอบ?");
        if (!confirmed) return;
      }

      try {
        await deleteReplyMutation.mutateAsync({ storeId, reviewId });
        showToast("ลบคำตอบสำเร็จ", "success");
      } catch (error) {
        console.error("Failed to delete reply:", error);
        showToast("ไม่สามารถลบคำตอบได้ กรุณาลองอีกครั้ง", "error");
      }
    },
    [storeId, deleteReplyMutation, showToast]
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-night text-surface-light">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
              <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-night-lighter/70 p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 rounded bg-white/5" />
                      <div className="h-3 w-20 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="h-16 rounded-xl bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-night text-surface-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">กรุณาเข้าสู่ระบบ</h1>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            ไปหน้าบัญชี
          </Link>
        </div>
      </div>
    );
  }

  const reviews = ratingData?.recentReviews || [];

  return (
    <div className="min-h-screen bg-night text-surface-light">
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <Link
                href={`/account/owner/${storeId}`}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-surface-light transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                กลับหน้าร้าน {store?.name || ""}
              </Link>
              <h1 className="text-3xl font-display font-bold mt-4">จัดการรีวิว</h1>
              <p className="text-muted mt-1">
                {store?.name || ""} -- {ratingData?.totalReviews || 0} รีวิว
              </p>
            </div>

            {/* Summary bar */}
            {ratingData && (
              <div className="rounded-2xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-4 shadow-card flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-accent-light">
                    {ratingData.averageRating > 0
                      ? ratingData.averageRating.toFixed(1)
                      : "-"}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        filled={star <= Math.round(ratingData.averageRating)}
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted">
                  {ratingData.totalReviews} รีวิวทั้งหมด
                </span>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-12 shadow-card text-center">
                <div className="w-14 h-14 rounded-full bg-night/60 mx-auto flex items-center justify-center mb-4">
                  <ChatIcon className="w-6 h-6 text-muted" />
                </div>
                <p className="text-lg font-semibold">ยังไม่มีรีวิว</p>
                <p className="text-sm text-muted mt-1">
                  รีวิวจากลูกค้าจะปรากฏที่นี่เมื่อมีการรีวิว
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const isReplying = replyingTo === review.id;
                  const isEditing = editingReply === review.id;
                  const isMutating =
                    replyMutation.isPending ||
                    updateReplyMutation.isPending ||
                    deleteReplyMutation.isPending;

                  return (
                    <article
                      key={review.id}
                      className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-4"
                    >
                      {/* Review header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-5 h-5 text-primary-light" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {review.userDisplayName || "ผู้ใช้งาน"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon
                                    key={star}
                                    filled={star <= review.rating}
                                    className="w-3.5 h-3.5"
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted">
                                {new Date(review.createdAt).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review content */}
                      {review.title && (
                        <h3 className="text-sm font-semibold">{review.title}</h3>
                      )}
                      <p className="text-sm text-surface-light/80">{review.contentPreview}</p>

                      {/* Owner reply section */}
                      {review.ownerReply && !isEditing ? (
                        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ReplyIcon className="w-4 h-4 text-accent-light" />
                              <span className="text-xs font-semibold text-accent-light">
                                คำตอบจากเจ้าของร้าน
                              </span>
                            </div>
                            {review.ownerReplyAt && (
                              <span className="text-[10px] text-muted">
                                {new Date(review.ownerReplyAt).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-surface-light/80">{review.ownerReply}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(review.id, review.ownerReply!)}
                              disabled={isMutating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-white/10 text-muted hover:text-surface-light hover:border-white/30 transition-all duration-300 disabled:opacity-50"
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteReply(review.id)}
                              disabled={isMutating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border border-white/10 text-muted hover:text-error hover:border-error/40 transition-all duration-300 disabled:opacity-50"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              ลบ
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Reply form (new reply) */}
                      {!review.ownerReply && !isReplying && (
                        <button
                          onClick={() => handleStartReply(review.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-accent/30 text-accent-light text-sm hover:bg-accent/10 transition-all duration-300"
                        >
                          <ReplyIcon className="w-4 h-4" />
                          ตอบรีวิว
                        </button>
                      )}

                      {/* Reply textarea */}
                      {(isReplying || isEditing) && (
                        <div className="space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="เขียนคำตอบของคุณ..."
                            className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent resize-none"
                            autoFocus
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={handleCancelReply}
                              className="px-4 py-2 rounded-xl text-sm text-muted border border-white/10 hover:border-white/30 transition-all duration-300"
                            >
                              ยกเลิก
                            </button>
                            <button
                              onClick={() =>
                                isEditing
                                  ? handleUpdateReply(review.id)
                                  : handleSubmitReply(review.id)
                              }
                              disabled={isMutating || !replyText.trim()}
                              className={cn(
                                "px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                                isMutating || !replyText.trim()
                                  ? "bg-accent/20 text-accent-light/50 cursor-not-allowed"
                                  : "bg-accent/20 text-accent-light border border-accent/40 hover:bg-accent/30"
                              )}
                            >
                              {isMutating ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-accent-light/30 border-t-accent-light rounded-full animate-spin" />
                                  กำลังบันทึก...
                                </span>
                              ) : isEditing ? (
                                "อัปเดตคำตอบ"
                              ) : (
                                "ส่งคำตอบ"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Icon components ---------- */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg className={cn(className, filled ? "text-accent-light" : "text-white/15")} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ReplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M15 4h-6l-1 3h8l-1-3z" />
    </svg>
  );
}
