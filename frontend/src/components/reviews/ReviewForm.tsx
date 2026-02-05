'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { StarRating } from './StarRating';
import { useCreateReview } from '@/hooks/useReviews';
import { ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { MOOD_OPTIONS, VIBE_DIMENSIONS, type MoodId, type VibeDimensionId } from '@/lib/mood';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  storeId: string;
  onSuccess?: () => void;
  className?: string;
}

interface FormErrors {
  rating?: string;
  title?: string;
  content?: string;
  mood?: string;
}

const createDefaultVibeScores = (): Record<VibeDimensionId, number> => {
  return VIBE_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension.id] = 5;
    return acc;
  }, {} as Record<VibeDimensionId, number>);
};

const HIGHLIGHT_MAX = 200;

export function ReviewForm({ storeId, onSuccess, className = '' }: ReviewFormProps) {
  const { user, loading: authLoading, signOut } = useFirebaseAuth();
  const createReview = useCreateReview();
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId | null>(null);
  const [vibeScores, setVibeScores] = useState<Record<VibeDimensionId, number>>(() => createDefaultVibeScores());
  const [highlight, setHighlight] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const clampValue = (value: number) => Math.min(Math.max(value, 1), 10);

  const handleVibeScoreChange = (dimensionId: VibeDimensionId, value: number) => {
    setVibeScores((prev) => ({
      ...prev,
      [dimensionId]: clampValue(value),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (rating === 0) {
      newErrors.rating = 'กรุณาเลือกคะแนน';
    }

    if (!selectedMoodId) {
      newErrors.mood = 'กรุณาเลือกอารมณ์ที่ตรงที่สุด';
    }

    if (title.length > 200) {
      newErrors.title = 'หัวข้อต้องไม่เกิน 200 ตัวอักษร';
    }

    if (content.trim().length < 10) {
      newErrors.content = 'รีวิวต้องมีอย่างน้อย 10 ตัวอักษร';
    } else if (content.length > 2000) {
      newErrors.content = 'รีวิวต้องไม่เกิน 2000 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowSignIn(true);
      showToast('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว', 'info');
      return;
    }

    if (!validateForm()) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    setSubmitError(null);

    try {
      await createReview.mutateAsync({
        storeId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        moodFeedback: {
          moodCode: selectedMoodId!,
          energyScore: vibeScores.energy,
          musicScore: vibeScores.music,
          crowdScore: vibeScores.crowd,
          conversationScore: vibeScores.conversation,
          creativityScore: vibeScores.creativity,
          serviceScore: vibeScores.service,
          highlightQuote: highlight.trim() || undefined,
        },
      });

      // Reset form on success
      setRating(0);
      setTitle('');
      setContent('');
      setSelectedMoodId(null);
      setVibeScores(createDefaultVibeScores());
      setHighlight('');
      setErrors({});

      showToast('ขอบคุณสำหรับรีวิวของคุณ!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create review:', error);

      // Handle 401 Unauthorized - token expired or invalid
      if (error instanceof ApiError && error.status === 401) {
        const sessionMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
        setSubmitError(sessionMessage);
        showToast(sessionMessage, 'warning');
        // Sign out and clear auth state
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Failed to sign out:', signOutError);
        }
        setShowSignIn(true);
        return;
      }

      // Handle 400 Bad Request - validation errors
      if (error instanceof ApiError && error.status === 400) {
        // Try to extract error message from backend response
        const errorData = error.data as any;
        console.log('400 Error data:', errorData);

        let validationMessage: string | null = null;

        if (errorData?.message) {
          validationMessage = errorData.message;
        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
          // FluentValidation errors array
          validationMessage = errorData.errors.join(', ');
        } else if (typeof errorData === 'object' && errorData !== null) {
          // Try to get first error message from object
          const firstError = Object.values(errorData)[0];
          if (typeof firstError === 'string') {
            validationMessage = firstError;
          } else {
            validationMessage = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
          }
        } else {
          validationMessage = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
        }
        setSubmitError(validationMessage);
        showToast(validationMessage ?? 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง', 'warning');
        return;
      }

      // Handle other errors
      const errorMessage =
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง';
      setSubmitError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  if (authLoading) {
    return (
      <div className={`bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(235, 16, 70, 0.5))',
            }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-display font-semibold text-surface-light mb-2">
              เข้าสู่ระบบเพื่อรีวิว
            </h3>
            <p className="text-sm text-muted">
              กรุณาเข้าสู่ระบบด้วย Google เพื่อแชร์ประสบการณ์ของคุณ
            </p>
          </div>
          <GoogleSignInButton
            onSuccess={() => setShowSignIn(false)}
            className="max-w-sm mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}
      style={{
        boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      }}
    >
      <h3 className="text-lg font-display font-semibold text-surface-light mb-6">
        เขียนรีวิว
      </h3>

      {/* Rating Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-surface-light mb-3">
          คะแนน <span className="text-red-400">*</span>
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="lg"
        />
        {errors.rating && (
          <p className="mt-2 text-sm text-red-400">{errors.rating}</p>
        )}
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-surface-light">
              อารมณ์ของร้าน (Mood) <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-muted mt-1">
              เลือกโหมดที่ตรงกับประสบการณ์ของคุณมากที่สุด เพื่อช่วยให้ Mood & Vibe แม่นยำขึ้น
            </p>
          </div>
          {errors.mood && (
            <p className="text-xs text-red-400">{errors.mood}</p>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {MOOD_OPTIONS.map((option) => {
            const isActive = option.id === selectedMoodId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedMoodId(option.id)}
                className={cn(
                  "text-left rounded-2xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  "bg-night/40 hover:-translate-y-0.5",
                  isActive ? "border-primary/70 shadow-glow-blue" : "border-white/10 hover:border-white/30"
                )}
                aria-pressed={isActive}
              >
                <p className="text-xs uppercase tracking-wide text-muted mb-1">Mood</p>
                <p className="text-base font-semibold text-surface-light">{option.title}</p>
                <p className="text-xs text-muted/80 mt-1">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vibe Dimensions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-surface-light mb-1">
          ให้คะแนน Vibe 6 มิติ
        </label>
        <p className="text-xs text-muted mb-4">
          เลื่อนสเกล 1-10 เพื่อบอกระดับพลังงาน เพลง ความหนาแน่น และบรรยากาศโดยรวม
        </p>
        <div className="space-y-5">
          {VIBE_DIMENSIONS.map((dimension) => (
            <div key={dimension.id} className="rounded-2xl border border-white/10 bg-night/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{dimension.label}</p>
                  <p className="text-sm text-muted/80">{dimension.description}</p>
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
              <div className="flex justify-between text-[11px] text-muted mt-1">
                <span>นิ่ง</span>
                <span>จัดเต็ม</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <label htmlFor="review-title" className="block text-sm font-medium text-surface-light mb-2">
          หัวข้อ (ไม่บังคับ)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="สรุปประสบการณ์ของคุณ"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.title && (
            <p className="text-sm text-red-400">{errors.title}</p>
          )}
          <p className="text-xs text-muted ml-auto">{title.length}/200</p>
        </div>
      </div>

      {/* Content Input */}
      <div className="mb-6">
        <label htmlFor="review-content" className="block text-sm font-medium text-surface-light mb-2">
          รีวิว <span className="text-red-400">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={6}
          placeholder="แชร์ประสบการณ์ของคุณ (อย่างน้อย 10 ตัวอักษร)"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.content && (
            <p className="text-sm text-red-400">{errors.content}</p>
          )}
          <p className={`text-xs ml-auto ${content.length < 10 ? 'text-red-400' : content.length > 2000 ? 'text-red-400' : 'text-muted'}`}>
            {content.length}/2000
          </p>
        </div>
      </div>

      {/* Highlight Input */}
      <div className="mb-6">
        <label htmlFor="review-highlight" className="block text-sm font-medium text-surface-light mb-2">
          ไฮไลต์สั้นๆ (ไม่บังคับ)
        </label>
        <textarea
          id="review-highlight"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          maxLength={HIGHLIGHT_MAX}
          rows={2}
          placeholder="เช่น “เพลงแจ๊ซเบาๆ เหมาะนั่งคุยทั้งคืน”"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        <div className="flex justify-end text-xs text-muted mt-1">
          {highlight.length}/{HIGHLIGHT_MAX}
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
          style={{
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)',
          }}
        >
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={createReview.isPending}
        className="group relative w-full px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* Neon glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: '0 0 30px rgba(235, 16, 70, 0.5), inset 0 0 20px rgba(103, 41, 255, 0.2)',
          }}
        />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {createReview.isPending ? (
            <>
              <div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))',
                }}
              />
              <span>กำลังส่งรีวิว...</span>
            </>
          ) : (
            'ส่งรีวิว'
          )}
        </span>
      </button>
    </form>
  );
}
