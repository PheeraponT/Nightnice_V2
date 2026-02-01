"use client";

import { SITE_URL } from "@/lib/constants";
import type { EventDetailDto } from "@/lib/api";
import { ShareButtons } from "@/components/ui/ShareButtons";

interface EventDetailClientProps {
  event: EventDetailDto;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const eventUrl = `${SITE_URL}/events/${event.slug}`;
  const shareTitle = `${event.title} @ ${event.storeName}`;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-display font-semibold text-surface-light mb-4">
        แชร์อีเวนท์นี้
      </h3>

      <ShareButtons
        url={eventUrl}
        title={shareTitle}
        variant="button"
        platforms={["facebook", "twitter", "line", "copy"]}
      />
    </div>
  );
}
