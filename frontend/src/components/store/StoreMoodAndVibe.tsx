"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type MoodId,
  type MoodSnapshot,
  type MoodStoreContext,
} from "@/lib/mood";
import { buildSnapshotFromInsight } from "@/lib/mood";
import { useStoreMoodInsight } from "@/hooks/useMoodInsights";
import { StoreMoodPulseForm } from "./StoreMoodPulseForm";

interface StoreMoodAndVibeProps {
  storeId: string;
  snapshot: MoodSnapshot;
  storeContext: MoodStoreContext;
}

const MOOD_EMOJIS: Record<MoodId, string> = {
  chill: "🌊",
  social: "💛",
  romantic: "💗",
  party: "💜",
  adventurous: "🧡",
  solo: "🌙",
};

export function StoreMoodAndVibe({ storeId, snapshot, storeContext }: StoreMoodAndVibeProps) {
  const { data: liveInsight, isFetching: isInsightRefreshing } = useStoreMoodInsight(storeId);
  const resolvedSnapshot = useMemo(() => {
    if (liveInsight && liveInsight.totalResponses > 0) {
      return buildSnapshotFromInsight(storeContext, liveInsight);
    }
    return snapshot;
  }, [liveInsight, snapshot, storeContext]);

  const [activeMoodId, setActiveMoodId] = useState(resolvedSnapshot.primaryMoodId);
  const [showPulseForm, setShowPulseForm] = useState(false);

  useEffect(() => {
    setActiveMoodId(resolvedSnapshot.primaryMoodId);
  }, [resolvedSnapshot.primaryMoodId]);

  const activeMood = useMemo(() => {
    return resolvedSnapshot.moodScores.find((entry) => entry.mood.id === activeMoodId) ?? resolvedSnapshot.moodScores[0];
  }, [activeMoodId, resolvedSnapshot.moodScores]);

  const hasCommunityData = resolvedSnapshot.meta?.source === "community";
  const totalResponses = resolvedSnapshot.meta?.totalResponses ?? 0;

  return (
    <section className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-card p-4 md:p-5">
      {/* Row 1: Hero - Match Ring + Info + CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Match Ring - Compact */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 100, height: 100 }}
          aria-label="Match percentage"
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="-rotate-90"
            style={{ display: "block" }}
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={activeMood.mood.colorHex}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(activeMood.score, 100) * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-light">{activeMood.score}%</p>
              <p className="text-[10px] text-muted">Match</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-lg">{MOOD_EMOJIS[activeMood.mood.id]}</span>
            <h2 className="text-lg font-semibold text-surface-light truncate">{activeMood.mood.title}</h2>
          </div>
          <p className="text-sm text-muted line-clamp-2">{activeMood.reason}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px]">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 border",
                hasCommunityData
                  ? "border-success/50 text-success/90 bg-success/10"
                  : "border-white/10 text-muted bg-white/5"
              )}
            >
              {hasCommunityData ? `${totalResponses} เสียง` : "AI mode"}
            </span>
            {isInsightRefreshing && (
              <span className="text-muted/70">refreshing...</span>
            )}
          </div>
        </div>

        {/* CTA Button - Primary */}
        <button
          type="button"
          onClick={() => setShowPulseForm(!showPulseForm)}
          className={cn(
            "flex-shrink-0 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
            "bg-gradient-to-r from-primary to-accent text-white",
            "hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
            "active:scale-95",
            showPulseForm && "ring-2 ring-white/30"
          )}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            ให้คะแนน Mood
          </span>
        </button>
      </div>

      {/* Expandable Pulse Form */}
      {showPulseForm && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <StoreMoodPulseForm
            storeId={storeId}
            defaultMoodId={resolvedSnapshot.primaryMoodId}
            moodScores={resolvedSnapshot.moodScores}
            totalResponses={totalResponses}
          />
        </div>
      )}

      {/* Row 2: Mood Pills */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Mood Match</p>
          <p className="text-[10px] text-muted">กดเพื่อดูรายละเอียด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {resolvedSnapshot.moodScores.map((entry) => {
            const isActive = entry.mood.id === activeMoodId;
            const isPrimary = entry.mood.id === resolvedSnapshot.primaryMoodId;
            const isSecondary = entry.mood.id === resolvedSnapshot.secondaryMoodId;
            return (
              <button
                key={entry.mood.id}
                type="button"
                onClick={() => setActiveMoodId(entry.mood.id)}
                className={cn(
                  "group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all duration-150",
                  isActive
                    ? "border-primary/60 bg-primary/15 text-surface-light ring-1 ring-primary/40"
                    : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:bg-white/10"
                )}
              >
                <span>{MOOD_EMOJIS[entry.mood.id]}</span>
                <span className="font-medium">{entry.mood.title}</span>
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold",
                    isPrimary
                      ? "bg-primary/80 text-white"
                      : isSecondary
                        ? "bg-accent/80 text-white"
                        : "bg-white/10 text-muted"
                  )}
                >
                  {entry.score}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Vibe Dimensions - Compact Horizontal Bars */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Vibe Dimensions</p>
          <p className="text-[10px] text-muted">1-10</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
          {resolvedSnapshot.vibeScores.map((item) => (
            <div key={item.dimension.id} className="flex items-center gap-2">
              <span className={cn("text-[11px] w-20 truncate", item.dimension.accent)}>
                {item.dimension.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", item.dimension.bar)}
                  style={{ width: `${(item.score / 10) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-surface-light w-5 text-right">
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Quote - Optional, only if has meaningful quote */}
      {resolvedSnapshot.quote && resolvedSnapshot.quote !== "ยังไม่มีคำบรรยายจากทางร้าน" && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <blockquote className="text-sm text-muted/90 italic border-l-2 border-primary/40 pl-3">
            "{resolvedSnapshot.quote}"
          </blockquote>
        </div>
      )}
    </section>
  );
}
