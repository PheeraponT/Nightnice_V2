"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useCalendarEvents } from "@/hooks/useEvents";
import { useProvinces } from "@/hooks/useProvinces";
import { EventCalendar } from "@/components/events";
import { cn } from "@/lib/utils";

export default function EventsCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();

  const { data: events = [], isLoading } = useCalendarEvents(year, month, selectedProvince);
  const { data: provinces = [] } = useProvinces();

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  return (
    <div className="min-h-screen bg-night">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-night" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">
              ปฏิทินอีเวนท์
            </h1>
            <p className="text-muted mb-6">
              ดูอีเวนท์และกิจกรรมทั้งหมดในรูปแบบปฏิทิน
            </p>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <Link href="/events" className="hover:text-primary transition-colors">
                อีเวนท์ทั้งหมด
              </Link>
              <span>/</span>
              <span className="text-surface-light">ปฏิทิน</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-20 bg-night/95 backdrop-blur-lg border-b border-white/5 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-surface-light">
              กรองตามจังหวัด
            </h2>
            <select
              value={selectedProvince || ""}
              onChange={(e) => setSelectedProvince(e.target.value || undefined)}
              className="bg-dark-lighter border border-white/10 rounded-lg px-4 py-2 text-sm text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">ทุกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.slug} value={province.slug}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <EventCalendar
            events={events}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-dark-lighter text-muted hover:bg-dark-light hover:text-surface-light border border-white/10"
              )}
            >
              ดูอีเวนท์ทั้งหมด
            </Link>
            <Link
              href="/"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-dark-lighter text-muted hover:bg-dark-light hover:text-surface-light border border-white/10"
              )}
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
