"use client";

import Link from "next/link";
import { useStoreEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events";
import { cn } from "@/lib/utils";

interface StoreEventsProps {
  storeSlug: string;
}

export function StoreEvents({ storeSlug }: StoreEventsProps) {
  const { data: events = [], isLoading } = useStoreEvents(storeSlug, true, 4);

  // Don't show section if no events
  if (!isLoading && events.length === 0) {
    return null;
  }

  return (
    <div className="bg-night-lighter/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-display font-semibold text-surface-light">
            อีเวนท์ที่กำลังจะมาถึง
          </h2>
        </div>
        {events.length > 0 && (
          <Link
            href="/events"
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            ดูทั้งหมด
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} compact />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-night border border-white/5 animate-pulse">
      <div className="aspect-[16/9] bg-muted/20" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted/20 rounded w-3/4" />
        <div className="h-3 bg-muted/20 rounded w-1/2" />
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
