"use client";

import { EventCard } from "./EventCard";
import type { EventListDto } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EventGridProps {
  events: EventListDto[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function EventGrid({
  events,
  className,
  isLoading = false,
  emptyMessage = "ไม่พบอีเวนท์ที่ค้นหา",
}: EventGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto w-16 h-16 text-muted/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-4 text-lg text-muted">{emptyMessage}</p>
        <p className="mt-2 text-sm text-muted/70">
          ลองปรับเงื่อนไขการค้นหาใหม่หรือรอดูอีเวนท์ใหม่เร็วๆ นี้
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="rounded-card overflow-hidden bg-dark-lighter border border-muted/20 animate-pulse">
      <div className="aspect-[3/4] bg-muted/20" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-muted/20 rounded w-3/4" />
        <div className="h-4 bg-muted/20 rounded w-1/2" />
        <div className="h-4 bg-muted/20 rounded w-1/3" />
        <div className="pt-3 border-t border-white/5">
          <div className="h-4 bg-muted/20 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
