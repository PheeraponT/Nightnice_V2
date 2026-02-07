"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MOOD_OPTIONS,
  type MoodId,
  type MoodOption,
} from "@/lib/mood";

const MOOD_BY_ID = new Map<MoodId, MoodOption>(MOOD_OPTIONS.map((mood) => [mood.id, mood]));

export interface CommunityPost {
  id: string;
  title: string;
  summary?: string | null;
  story?: string | null;
  store: {
    name: string;
    slug: string;
    provinceName?: string | null;
    moodMatch?: number | null;
  };
  moodId: MoodId;
  vibeTags: string[];
  images: Array<{
    src: string;
    alt?: string;
  }>;
  author: {
    id: string;
    name: string;
    role: string;
  };
  postedAt: string;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: string | null;
  onImageExpand?: (images: CommunityPost["images"], index: number) => void;
  onEdit?: (post: CommunityPost) => void;
  onDelete?: (postId: string) => void;
}

export function CommunityPostCard({ post, currentUserId, onImageExpand, onEdit, onDelete }: CommunityPostCardProps) {
  const mood = MOOD_BY_ID.get(post.moodId);
  const isOwner = currentUserId != null && post.author.id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const heroImage = post.images[0];
  const extraCount = post.images.length - 1;

  return (
    <article className="group relative rounded-2xl border border-white/8 bg-night-lighter/40 shadow-lg shadow-night/30 transition-all duration-200 hover:border-primary/30 hover:shadow-primary/10 overflow-hidden">
      {/* Image strip */}
      {heroImage ? (
        <button
          type="button"
          onClick={() => onImageExpand?.(post.images, 0)}
          className="relative block w-full aspect-[16/9] cursor-pointer overflow-hidden"
          aria-label="ดูรูปภาพ"
        >
          <Image
            src={heroImage.src}
            alt={heroImage.alt ?? post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
          {extraCount > 0 && (
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              +{extraCount}
            </span>
          )}
          {mood && (
            <span
              className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
              style={{ background: hexToRgba(mood.colorHex, 0.55) }}
            >
              {mood.title}
            </span>
          )}
        </button>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-night/30 text-xs text-muted">
          ยังไม่มีรูปในโพสต์นี้
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title row + menu */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-surface-light leading-snug line-clamp-2">{post.title}</h3>
            {post.summary && (
              <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">{post.summary}</p>
            )}
          </div>
          {isOwner && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-surface-light transition-colors"
                aria-label="เมนู"
              >
                <MoreIcon className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-night-lighter/95 shadow-xl backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit?.(post); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-surface-light hover:bg-white/5 transition-colors"
                  >
                    <EditIcon className="h-3.5 w-3.5 text-muted" />
                    แก้ไขโพสต์
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete?.(post.id); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    ลบโพสต์
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store + location */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <PinIcon className="h-3 w-3 shrink-0 text-primary-light" />
          <Link
            href={`/store/${post.store.slug}`}
            className="truncate hover:text-surface-light transition-colors"
          >
            {post.store.name}
          </Link>
          {post.store.provinceName && (
            <>
              <span className="text-white/20">·</span>
              <span className="truncate">{post.store.provinceName}</span>
            </>
          )}
        </div>

        {/* Vibe tags */}
        {post.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary-light"
              >
                #{tag}
              </span>
            ))}
            {post.vibeTags.length > 3 && (
              <span className="text-[10px] text-muted">+{post.vibeTags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[11px] text-muted">
          <span>{formatRelativeTime(post.postedAt)}</span>
          <span className="truncate max-w-[50%] text-right">{post.author.name}</span>
        </div>
      </div>
    </article>
  );
}

function formatRelativeTime(date: string) {
  const current = new Date();
  const target = new Date(date);
  const diffMs = current.getTime() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / minute));
    return `${minutes} นาทีที่แล้ว`;
  }
  if (diffMs < day) {
    const hours = Math.round(diffMs / hour);
    return `${hours} ชั่วโมงที่แล้ว`;
  }
  if (diffMs < week) {
    const days = Math.round(diffMs / day);
    return `${days} วันก่อน`;
  }
  return target.toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
  });
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 3.487a2.1 2.1 0 113.03 2.91L8.127 18.162l-4.252.945.945-4.252L16.862 3.487z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
