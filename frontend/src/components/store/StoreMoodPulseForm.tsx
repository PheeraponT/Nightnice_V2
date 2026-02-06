"use client";

import { useEffect, useMemo, useState } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/components/ui/Toast";
import { useSubmitMoodFeedback } from "@/hooks/useMoodInsights";
import { MOOD_OPTIONS, VIBE_DIMENSIONS, type MoodId, type MoodScore, type VibeDimensionId } from "@/lib/mood";
import { cn } from "@/lib/utils";

interface StoreMoodPulseFormProps {
  storeId: string;
  defaultMoodId: MoodId;
  moodScores: MoodScore[];
  totalResponses?: number;
  compact?: boolean;
}

const createDefaultScores = () => {
  return VIBE_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension.id] = 6;
    return acc;
  }, {} as Record<VibeDimensionId, number>);
};

export function StoreMoodPulseForm({ storeId, defaultMoodId, moodScores, totalResponses, compact }: StoreMoodPulseFormProps) {
  const { user, loading: authLoading } = useFirebaseAuth();
  const submitMood = useSubmitMoodFeedback(storeId);
  const { showToast } = useToast();
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId>(defaultMoodId);
  const [vibeScores, setVibeScores] = useState<Record<VibeDimensionId, number>>(() => createDefaultScores());
  const [highlight, setHighlight] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    setSelectedMoodId(defaultMoodId);
  }, [defaultMoodId]);

  const topMoods = useMemo(() => moodScores.slice(0, 3), [moodScores]);

  const handleVibeScoreChange = (dimensionId: VibeDimensionId, value: number) => {
    setVibeScores((prev) => ({
      ...prev,
      [dimensionId]: Math.min(Math.max(value, 1), 10),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoodId) {
      setLocalError("เลือกอารมณ์ที่ตรงกับประสบการณ์");
      return;
    }
    setLocalError(null);
    setJustSubmitted(false);

    try {
      await submitMood.mutateAsync({
        moodCode: selectedMoodId,
        energyScore: vibeScores.energy,
        musicScore: vibeScores.music,
        crowdScore: vibeScores.crowd,
        conversationScore: vibeScores.conversation,
        creativityScore: vibeScores.creativity,
        serviceScore: vibeScores.service,
        highlightQuote: highlight.trim() || undefined,
      });

      showToast("บันทึก Mood & Vibe เรียบร้อย", "success");
      setJustSubmitted(true);
      setHighlight("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ไม่สามารถบันทึก Mood Pulse ได้ กรุณาลองใหม่";
      showToast(message, "error");
      setLocalError(message);
    }
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-white/10 bg-night/60 p-4 flex flex-col gap-3 min-w-[200px] max-w-[240px]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Mood Pulse</p>
          <h3 className="text-sm font-semibold text-surface-light">แชร์ความรู้สึก</h3>
          <p className="text-[11px] text-muted">
            {totalResponses?.toLocaleString("th-TH") ?? 0} เสียงแล้ว
          </p>
        </div>
        {authLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <GoogleSignInButton />
        ) : justSubmitted ? (
          <span className="text-xs text-success bg-success/10 border border-success/20 rounded-full px-3 py-1.5 text-center">
            ขอบคุณที่ช่วย!
          </span>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {topMoods.slice(0, 3).map((entry) => (
                <button
                  key={entry.mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(entry.mood.id)}
                  className={cn(
                    "px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors",
                    entry.mood.id === selectedMoodId
                      ? "border-primary/60 bg-primary/10 text-surface-light"
                      : "border-white/10 text-muted hover:border-white/30"
                  )}
                >
                  {entry.mood.title}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitMood.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-accent py-2 text-xs font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitMood.isPending ? "..." : "ส่ง Pulse"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-night/60 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Community Mood Pulse</p>
          <h3 className="text-lg font-semibold text-surface-light">แชร์ความรู้สึกใน 30 วิ</h3>
          <p className="text-xs text-muted">
            ช่วยล็อกอิน mood ให้เพื่อนสายกลางคืน — สะสมแล้ว {totalResponses?.toLocaleString("th-TH") ?? 0} เสียง
          </p>
        </div>
        {justSubmitted && (
          <span className="text-xs text-success bg-success/10 border border-success/20 rounded-full px-3 py-1">
            ขอบคุณที่ช่วย!
          </span>
        )}
      </div>

      {authLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !user ? (
        <div className="bg-night/80 border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-surface-light font-medium mb-2">
            เข้าสู่ระบบเพื่อให้คะแนน Mood Pulse
          </p>
          <p className="text-xs text-muted mb-4">
            ใช้บัญชี Google เพื่อยืนยันว่าคุณเคยไปจริง (ไม่เผยแพร่ที่สาธารณะ)
          </p>
          <GoogleSignInButton />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted mb-2">Step 1 · Mood</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {topMoods.map((entry) => (
                <button
                  key={entry.mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(entry.mood.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                    entry.mood.id === selectedMoodId
                      ? "border-primary/60 bg-primary/10 text-surface-light"
                      : "border-white/10 text-muted hover:border-white/30"
                  )}
                >
                  {entry.mood.title}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.filter((option) => !topMoods.some((entry) => entry.mood.id === option.id)).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedMoodId(option.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-[11px] transition-colors",
                    option.id === selectedMoodId
                      ? "border-primary/60 text-primary-light"
                      : "border-white/10 text-muted hover:border-white/30"
                  )}
                >
                  {option.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted mb-2">Step 2 · Vibe 6 มิติ</p>
            <div className="space-y-4">
              {VIBE_DIMENSIONS.map((dimension) => (
                <div key={dimension.id} className="rounded-xl border border-white/10 bg-night/70 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted">{dimension.label}</p>
                      <p className="text-sm text-surface-light">{dimension.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-surface-light">
                      {vibeScores[dimension.id]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={vibeScores[dimension.id]}
                    onChange={(e) => handleVibeScoreChange(dimension.id, Number(e.target.value))}
                    className="w-full accent-primary/80"
                  />
                  <div className="flex justify-between text-[10px] text-muted mt-1">
                    <span>{dimension.messages.low}</span>
                    <span>{dimension.messages.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="pulse-highlight" className="text-xs uppercase tracking-[0.3em] text-muted mb-2 block">
              Step 3 · ไฮไลต์สั้นๆ (ไม่บังคับ)
            </label>
            <textarea
              id="pulse-highlight"
              rows={2}
              maxLength={200}
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="เช่น “เพลงแจ๊ซเบาๆ คุยกันได้ทั้งคืน”"
              className="w-full rounded-xl border border-white/10 bg-night/70 px-4 py-3 text-sm text-surface-light placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <p className="text-[11px] text-muted text-right mt-1">{highlight.length}/200</p>
          </div>

          {localError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              {localError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitMood.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMood.isPending ? "กำลังบันทึก..." : "ส่ง Mood Pulse"}
          </button>
        </form>
      )}
    </div>
  );
}
