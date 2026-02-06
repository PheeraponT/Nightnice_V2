"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  useOwnedStore,
  useViewAnalytics,
  useRatingAnalytics,
  useMoodAnalytics,
} from "@/hooks/useOwnerDashboard";
import { cn } from "@/lib/utils";

const DAY_OPTIONS = [
  { value: 7, label: "7 วัน" },
  { value: 30, label: "30 วัน" },
  { value: 90, label: "90 วัน" },
];

export default function AnalyticsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useFirebaseAuth();
  const { data: store } = useOwnedStore(storeId);
  const [viewDays, setViewDays] = useState(30);

  const { data: viewData, isLoading: isViewsLoading } = useViewAnalytics(storeId, viewDays);
  const { data: ratingData, isLoading: isRatingsLoading } = useRatingAnalytics(storeId);
  const { data: moodData, isLoading: isMoodLoading } = useMoodAnalytics(storeId);

  const maxDailyView = useMemo(() => {
    if (!viewData?.dailyViews?.length) return 1;
    return Math.max(...viewData.dailyViews.map((d) => d.viewCount), 1);
  }, [viewData]);

  const ratingBars = useMemo(() => {
    if (!ratingData) return [];
    const total = ratingData.totalReviews || 1;
    return [
      { stars: 5, count: ratingData.totalRating5, pct: (ratingData.totalRating5 / total) * 100 },
      { stars: 4, count: ratingData.totalRating4, pct: (ratingData.totalRating4 / total) * 100 },
      { stars: 3, count: ratingData.totalRating3, pct: (ratingData.totalRating3 / total) * 100 },
      { stars: 2, count: ratingData.totalRating2, pct: (ratingData.totalRating2 / total) * 100 },
      { stars: 1, count: ratingData.totalRating1, pct: (ratingData.totalRating1 / total) * 100 },
    ];
  }, [ratingData]);

  if (loading) {
    return <AnalyticsSkeleton />;
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

  return (
    <div className="min-h-screen bg-night text-surface-light">
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <Link
                href={`/account/owner/${storeId}`}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-surface-light transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                กลับหน้าร้าน {store?.name || ""}
              </Link>
              <h1 className="text-3xl font-display font-bold mt-4">สถิติร้าน</h1>
              <p className="text-muted mt-1">{store?.name || ""}</p>
            </div>

            {/* ======================== VIEWS SECTION ======================== */}
            <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
              <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">การเข้าชม</p>
                  <h2 className="text-2xl font-display">Views</h2>
                </div>
                <div className="flex items-center gap-2">
                  {DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setViewDays(opt.value)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                        viewDays === opt.value
                          ? "bg-primary/20 text-primary-light border border-primary/40"
                          : "border border-white/10 text-muted hover:border-white/30 hover:text-surface-light"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </header>

              {isViewsLoading ? (
                <div className="h-48 flex items-center justify-center text-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </div>
              ) : viewData ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-night/60 p-4">
                    <p className="text-xs text-muted mb-1">วิวรวม ({viewDays} วัน)</p>
                    <p className="text-3xl font-display font-bold text-primary-light">
                      {viewData.totalViews.toLocaleString("th-TH")}
                    </p>
                  </div>

                  {/* Bar chart */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">วิวรายวัน</p>
                    <div className="flex items-end gap-[2px] h-48 pt-4">
                      {viewData.dailyViews.map((day) => {
                        const heightPct = (day.viewCount / maxDailyView) * 100;
                        const dateLabel = new Date(day.date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        });
                        return (
                          <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-1 group relative"
                          >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-night-lighter border border-white/10 rounded-lg px-2 py-1 text-[10px] text-surface-light opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {dateLabel}: {day.viewCount} วิว
                            </div>
                            <div
                              className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/30 transition-all duration-300 group-hover:from-primary/80 group-hover:to-primary/50 min-h-[2px]"
                              style={{ height: `${Math.max(heightPct, 1)}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Date labels for first, middle, last */}
                    {viewData.dailyViews.length > 0 && (
                      <div className="flex justify-between text-[10px] text-muted px-1">
                        <span>
                          {new Date(viewData.dailyViews[0].date).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {viewData.dailyViews.length > 2 && (
                          <span>
                            {new Date(
                              viewData.dailyViews[Math.floor(viewData.dailyViews.length / 2)].date
                            ).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                        <span>
                          {new Date(
                            viewData.dailyViews[viewData.dailyViews.length - 1].date
                          ).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted">ไม่มีข้อมูลการเข้าชม</div>
              )}
            </article>

            {/* ======================== RATINGS SECTION ======================== */}
            <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
              <header>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">คะแนน</p>
                <h2 className="text-2xl font-display">Ratings</h2>
              </header>

              {isRatingsLoading ? (
                <div className="h-48 flex items-center justify-center text-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </div>
              ) : ratingData ? (
                <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                  {/* Average rating display */}
                  <div className="rounded-2xl border border-white/10 bg-night/60 p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-5xl font-display font-bold text-accent-light">
                      {ratingData.averageRating > 0
                        ? ratingData.averageRating.toFixed(1)
                        : "-"}
                    </p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          filled={star <= Math.round(ratingData.averageRating)}
                          className="w-5 h-5"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted mt-2">
                      {ratingData.totalReviews} รีวิว
                    </p>
                  </div>

                  {/* Rating breakdown bars */}
                  <div className="space-y-3">
                    {ratingBars.map((bar) => (
                      <div key={bar.stars} className="flex items-center gap-3">
                        <span className="text-sm text-muted w-6 text-right">{bar.stars}</span>
                        <StarIcon filled className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 h-3 rounded-full bg-night/60 border border-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent/40 transition-all duration-500"
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted w-12 text-right">
                          {bar.count} ({bar.pct.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted">ไม่มีข้อมูลคะแนน</div>
              )}
            </article>

            {/* ======================== MOOD SECTION ======================== */}
            <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
              <header>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">บรรยากาศ</p>
                <h2 className="text-2xl font-display">Mood Analytics</h2>
              </header>

              {isMoodLoading ? (
                <div className="h-48 flex items-center justify-center text-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>กำลังโหลดข้อมูล...</span>
                  </div>
                </div>
              ) : moodData && moodData.totalResponses > 0 ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-4 text-center">
                      <p className="text-xs text-muted">Primary Mood</p>
                      <p className="text-xl font-display font-bold text-primary-light mt-1">
                        {moodData.primaryMood || "-"}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {moodData.primaryMatchScore > 0
                          ? `${(moodData.primaryMatchScore * 100).toFixed(0)}% match`
                          : ""}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-4 text-center">
                      <p className="text-xs text-muted">Secondary Mood</p>
                      <p className="text-xl font-display font-bold text-accent-light mt-1">
                        {moodData.secondaryMood || "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-4 text-center">
                      <p className="text-xs text-muted">Responses</p>
                      <p className="text-xl font-display font-bold text-surface-light mt-1">
                        {moodData.totalResponses}
                      </p>
                    </div>
                  </div>

                  {/* Highlight quote */}
                  {moodData.highlightQuote && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-primary-light mb-2">Highlight Quote</p>
                      <p className="text-sm text-surface-light/80 italic">
                        &ldquo;{moodData.highlightQuote}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Mood scores */}
                  {moodData.moodScores.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">Mood Scores</p>
                      <div className="space-y-3">
                        {moodData.moodScores.map((mood) => (
                          <div key={mood.moodCode} className="flex items-center gap-3">
                            <span className="text-sm text-surface-light w-28 truncate">
                              {mood.moodCode}
                            </span>
                            <div className="flex-1 h-3 rounded-full bg-night/60 border border-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary/60 to-accent/40 transition-all duration-500"
                                style={{ width: `${mood.percentage.toFixed(0)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted w-12 text-right">
                              {mood.percentage.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vibe dimension scores */}
                  {moodData.vibeScores.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">Vibe Dimensions</p>
                      <div className="space-y-3">
                        {moodData.vibeScores.map((vibe) => (
                          <div key={vibe.dimension} className="flex items-center gap-3">
                            <span className="text-sm text-surface-light w-28 truncate">
                              {vibe.dimension}
                            </span>
                            <div className="flex-1 h-3 rounded-full bg-night/60 border border-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-accent/60 to-primary/40 transition-all duration-500"
                                style={{ width: `${(vibe.averageScore * 100).toFixed(0)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted w-12 text-right">
                              {(vibe.averageScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last submitted */}
                  {moodData.lastSubmittedAt && (
                    <p className="text-xs text-muted">
                      อัปเดตล่าสุด:{" "}
                      {new Date(moodData.lastSubmittedAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
                  <div className="w-14 h-14 rounded-full bg-night/60 mx-auto flex items-center justify-center mb-4">
                    <MoodIcon className="w-6 h-6 text-muted" />
                  </div>
                  <p className="text-lg font-semibold">ยังไม่มีข้อมูล Mood</p>
                  <p className="text-sm text-muted mt-1">
                    ข้อมูลจะปรากฏเมื่อลูกค้าส่ง mood feedback
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Skeleton ---------- */

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-night text-surface-light">
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
              <div className="h-10 w-48 rounded-xl bg-white/5 animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-night-lighter/70 p-6 space-y-4"
              >
                <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
                <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            ))}
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

function MoodIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
