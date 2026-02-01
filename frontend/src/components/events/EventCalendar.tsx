"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EventCalendarDto } from "@/lib/api";

// Event type colors for dots
const EVENT_TYPE_COLORS: Record<string, string> = {
  DjNight: "bg-purple-500",
  LiveMusic: "bg-blue-500",
  Party: "bg-pink-500",
  SpecialEvent: "bg-gold",
  LadiesNight: "bg-rose-400",
  HappyHour: "bg-amber-500",
  ThemeNight: "bg-indigo-500",
  Concert: "bg-red-500",
  Promotion: "bg-green-500",
  Other: "bg-gray-400",
};

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

interface EventCalendarProps {
  events: EventCalendarDto[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  isLoading?: boolean;
}

export function EventCalendar({
  events,
  year,
  month,
  onMonthChange,
  isLoading,
}: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    const days: { date: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      days.push({
        date,
        isCurrentMonth: false,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(date).padStart(2, "0")}`,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    return days;
  }, [year, month]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventCalendarDto[]> = {};
    events.forEach((event) => {
      const dateStr = event.startDate.split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [events]);

  const today = new Date().toISOString().split("T")[0];

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
    setSelectedDate(null);
  };

  const handleToday = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
    setSelectedDate(null);
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Calendar */}
      <div className="bg-dark-lighter rounded-card border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-muted" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-surface-light">
              {MONTH_NAMES[month - 1]} {year + 543}
            </h2>
            <button
              onClick={handleToday}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              วันนี้
            </button>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "py-2 text-center text-sm font-medium",
                i === 0 ? "text-red-400" : "text-muted"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={cn("grid grid-cols-7", isLoading && "opacity-50")}>
          {calendarData.map((day, index) => {
            const dayEvents = eventsByDate[day.dateStr] || [];
            const isToday = day.dateStr === today;
            const isSelected = day.dateStr === selectedDate;
            const isSunday = index % 7 === 0;

            return (
              <button
                key={`${day.dateStr}-${index}`}
                onClick={() => setSelectedDate(day.dateStr)}
                className={cn(
                  "aspect-square p-1 border-b border-r border-white/5 transition-colors relative",
                  "hover:bg-white/5",
                  !day.isCurrentMonth && "opacity-40",
                  isSelected && "bg-primary/10",
                  isToday && "ring-1 ring-inset ring-primary"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    isSunday && day.isCurrentMonth ? "text-red-400" : "text-surface-light",
                    isToday && "font-bold text-primary"
                  )}
                >
                  {day.date}
                </span>
                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          EVENT_TYPE_COLORS[event.eventType] || "bg-gray-400"
                        )}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted ml-0.5">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      <div className="bg-dark-lighter rounded-card border border-white/5 p-4">
        <h3 className="text-lg font-semibold text-surface-light mb-4">
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString("th-TH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "เลือกวันที่เพื่อดูอีเวนท์"}
        </h3>

        {selectedDate && selectedDateEvents.length === 0 && (
          <p className="text-muted text-sm">ไม่มีอีเวนท์ในวันนี้</p>
        )}

        <div className="space-y-3">
          {selectedDateEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block p-3 bg-dark rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "w-2 h-2 mt-1.5 rounded-full shrink-0",
                    EVENT_TYPE_COLORS[event.eventType] || "bg-gray-400"
                  )}
                />
                <div className="min-w-0">
                  <h4 className="font-medium text-surface-light truncate">
                    {event.title}
                  </h4>
                  <p className="text-sm text-muted truncate">{event.storeName}</p>
                  {event.startTime && (
                    <p className="text-xs text-muted mt-1">
                      เวลา {event.startTime.slice(0, 5)} น.
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <h4 className="text-sm font-medium text-muted mb-2">ประเภทอีเวนท์</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_TYPE_COLORS).slice(0, 6).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1 text-xs text-muted">
                <span className={cn("w-2 h-2 rounded-full", color)} />
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
