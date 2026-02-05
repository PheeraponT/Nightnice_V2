"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { MoodSnapshot, MoodScore, VibeScore } from "@/lib/mood";

interface StoreMoodAndVibeProps {
  snapshot: MoodSnapshot;
}

const iconComponents: Record<string, React.ReactElement> = {
  spark: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l1.7 5.2h5.3l-4.3 3.1 1.7 5.2-4.4-3.2-4.4 3.2 1.7-5.2L5 7.2h5.3L12 2z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  music: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M9 18V5l11-2v13" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  ),
  people: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="8" r="3" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth={1.5} />
      <path d="M2 20c0-2.8 2.2-5 5-5h2c2.8 0 5 2.2 5 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 20c0-2.8 2.2-5 5-5h2c2.8 0 5 2.2 5 5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a7.5 7.5 0 00-7.5-7.5h-3A7.5 7.5 0 003 11.5v.5a7.5 7.5 0 007.5 7.5h1.5V22l3.7-2.5H13.5A7.5 7.5 0 0021 12v-.5z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  flask: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 3v7.09L5.34 19.2A2 2 0 007.1 22h9.8a2 2 0 001.76-2.8L14 10.09V3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 20s-6-3.35-8.4-8.34C2.8 8.52 4.4 4.4 8.4 4.4c1.6 0 2.9.8 3.6 1.8.7-1 2-1.8 3.6-1.8 4 0 5.6 4.12 4.8 7.26C18 16.65 12 20 12 20z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function StoreMoodAndVibe({ snapshot }: StoreMoodAndVibeProps) {
  const [activeMoodId, setActiveMoodId] = useState(snapshot.primaryMoodId);

  const activeMood = useMemo(() => {
    return snapshot.moodScores.find((entry) => entry.mood.id === activeMoodId) ?? snapshot.moodScores[0];
  }, [activeMoodId, snapshot.moodScores]);

  const matchSummary = useMemo(() => {
    const secondary = snapshot.moodScores.find((entry) => entry.mood.id === snapshot.secondaryMoodId);
    return secondary
      ? `${activeMood.mood.title} + ${secondary.mood.title}`
      : activeMood.mood.title;
  }, [activeMood.mood.title, snapshot.moodScores, snapshot.secondaryMoodId]);

  const lastUpdatedLabel = useMemo(() => {
    if (!snapshot.meta?.lastUpdated) return null;
    try {
      return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(snapshot.meta.lastUpdated));
    } catch {
      return null;
    }
  }, [snapshot.meta?.lastUpdated]);

  return (
    <section className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl border border-white/10 shadow-card p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Mood Selection</p>
          <h2 className="mt-1 text-2xl font-display font-semibold text-surface-light">
            Mood & Vibe Matching
          </h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            {snapshot.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 border",
                snapshot.meta?.source === "community"
                  ? "border-success/50 text-success/90 bg-success/10"
                  : "border-white/10 text-muted bg-white/5"
              )}
            >
              {snapshot.meta?.source === "community"
                ? `ข้อมูลจาก ${snapshot.meta?.totalResponses ?? 0} ผู้ใช้จริง`
                : "โหมดตัวอย่างอัตโนมัติ"}
            </span>
            {lastUpdatedLabel && (
              <span className="text-muted/80">
                อัปเดต {lastUpdatedLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="relative w-28 h-28 rounded-full bg-night/80 border border-white/10 flex items-center justify-center"
            aria-label="เปอร์เซ็นต์ความเข้ากันของร้านกับอารมณ์ที่เลือก"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${activeMood.mood.colorHex} ${Math.min(activeMood.score, 100)}%, rgba(255,255,255,0.05) ${Math.min(activeMood.score, 100)}%)`,
                mask: "radial-gradient(circle at center, transparent 60%, black 61%)",
                WebkitMask: "radial-gradient(circle at center, transparent 60%, black 61%)",
              }}
            />
            <div className="relative text-center">
              <p className="text-3xl font-bold text-surface-light">{activeMood.score}%</p>
              <p className="text-xs text-muted">Match</p>
            </div>
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-surface-light">{matchSummary}</p>
            <p className="text-sm text-muted mt-1">{activeMood.reason}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          {snapshot.moodScores.map((entry) => (
            <button
              key={entry.mood.id}
              type="button"
              onClick={() => setActiveMoodId(entry.mood.id)}
              className={cn(
                "group text-left rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                "bg-gradient-to-br p-4",
                entry.mood.palette.background,
                entry.mood.palette.border,
                entry.mood.id === activeMoodId
                  ? "ring-2 ring-primary/60 shadow-glow-blue"
                  : "hover:-translate-y-0.5 hover:border-white/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted">Mood</p>
                  <p className="text-lg font-semibold text-surface-light">
                    {entry.mood.title}
                  </p>
                  <p className="mt-1 text-sm text-muted/90 line-clamp-2">
                    {entry.mood.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-night",
                    entry.mood.id === snapshot.primaryMoodId ? "bg-primary/90" : entry.mood.id === snapshot.secondaryMoodId ? "bg-accent/90" : "bg-white/70"
                  )}>
                    {entry.mood.id === snapshot.primaryMoodId
                      ? "Top"
                      : entry.mood.id === snapshot.secondaryMoodId
                        ? "Pair"
                        : "View"}
                  </span>
                  <p className="text-2xl font-bold text-surface-light mt-1">{entry.score}%</p>
                  <p className="text-xs text-muted">match</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted/90">
                {entry.reason}
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-night/60 border border-white/10 p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Mood Deck</p>
            <p className="mt-1 text-surface-light font-semibold">โหมดที่เข้ากับคุณที่สุด</p>
          </div>
          <div className="space-y-3">
            {snapshot.moodScores.slice(0, Math.min(2, snapshot.moodScores.length)).map((entry, index) => (
              <div key={entry.mood.id} className="flex items-center gap-3">
                <span className="text-sm text-muted uppercase tracking-wide">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-surface-light">{entry.mood.title}</p>
                  <p className="text-xs text-muted">{entry.mood.tagline}</p>
                </div>
                <span className="text-base font-bold text-surface-light">{entry.score}%</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">เสียงจากคนเคยไป</p>
            <blockquote className="mt-2 text-sm text-muted border-l border-white/10 pl-3">
              {snapshot.quote}
            </blockquote>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Vibe Dimensions</p>
            <h3 className="text-lg font-semibold text-surface-light">6 มิติคะแนน (1-10)</h3>
          </div>
          <p className="text-xs text-muted">อัปเดตอัตโนมัติจากรีวิวของ Nightnice</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {snapshot.vibeScores.map((item) => (
            <div key={item.dimension.id} className="rounded-2xl border border-white/10 bg-night/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center", item.dimension.accent)}>
                    {iconComponents[item.dimension.icon]}
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-muted">{item.dimension.label}</p>
                    <p className="text-base font-semibold text-surface-light">{item.dimension.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-surface-light leading-none">{item.score}</p>
                  <p className="text-xs text-muted">/10</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", item.dimension.bar)}
                    style={{ width: `${(item.score / 10) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">{item.emphasis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
