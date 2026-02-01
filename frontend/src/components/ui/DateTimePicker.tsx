"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Format date to YYYY-MM-DD using local timezone (not UTC)
function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Date Picker
interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder = "เลือกวันที่",
  disabled,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate calendar days
  const generateCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    onChange(formatDateToLocal(date));
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDateToLocal(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const today = formatDateToLocal(new Date());

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 bg-dark border rounded-xl text-left",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen ? "border-primary ring-2 ring-primary/30" : "border-muted/30 hover:border-muted/50",
          error && "border-red-500"
        )}
      >
        <CalendarIcon className="w-5 h-5 text-muted" />
        <span className={cn(value ? "text-surface-light" : "text-muted")}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-darker border border-muted/30 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-muted" />
            </button>
            <div className="text-sm font-medium text-surface-light">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "text-center text-xs font-medium py-1",
                  i === 0 ? "text-red-400" : "text-muted"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((day, index) => {
              const dateStr = formatDateToLocal(day.date);
              const isSelected = value === dateStr;
              const isToday = dateStr === today;
              const isDisabled = isDateDisabled(day.date);
              const isSunday = index % 7 === 0;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleSelectDate(day.date)}
                  disabled={isDisabled}
                  className={cn(
                    "w-8 h-8 text-sm rounded-lg transition-colors",
                    "hover:bg-primary/20",
                    "disabled:opacity-30 disabled:cursor-not-allowed",
                    !day.isCurrentMonth && "opacity-30",
                    isSelected && "bg-primary text-white hover:bg-primary",
                    isToday && !isSelected && "ring-1 ring-primary",
                    isSunday && day.isCurrentMonth && !isSelected ? "text-red-400" : "text-surface-light"
                  )}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewDate(now);
              handleSelectDate(now);
            }}
            className="mt-3 w-full py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            วันนี้
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Time Picker
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  label,
  error,
  placeholder = "เลือกเวลา",
  disabled,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const [hour, minute] = value ? value.split(":").map(Number) : [0, 0];

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTime = (h: number, m: number) => {
    const formatted = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDisplayTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} น.`;
  };

  // Quick select times
  const quickTimes = [
    { label: "18:00", value: "18:00" },
    { label: "19:00", value: "19:00" },
    { label: "20:00", value: "20:00" },
    { label: "21:00", value: "21:00" },
    { label: "22:00", value: "22:00" },
    { label: "23:00", value: "23:00" },
    { label: "00:00", value: "00:00" },
    { label: "01:00", value: "01:00" },
    { label: "02:00", value: "02:00" },
  ];

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-surface-light mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 bg-dark border rounded-xl text-left",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen ? "border-primary ring-2 ring-primary/30" : "border-muted/30 hover:border-muted/50",
          error && "border-red-500"
        )}
      >
        <ClockIcon className="w-5 h-5 text-muted" />
        <span className={cn(value ? "text-surface-light" : "text-muted")}>
          {value ? formatDisplayTime(value) : placeholder}
        </span>
      </button>

      {/* Time Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-darker border border-muted/30 rounded-xl shadow-xl w-64">
          {/* Quick Select */}
          <div className="mb-4">
            <p className="text-xs text-muted mb-2">เลือกด่วน</p>
            <div className="flex flex-wrap gap-1">
              {quickTimes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onChange(t.value)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors",
                    value === t.value
                      ? "bg-primary text-white"
                      : "bg-dark text-muted hover:text-surface-light hover:bg-white/10"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hour & Minute Selectors */}
          <div className="flex gap-4">
            {/* Hours */}
            <div className="flex-1">
              <p className="text-xs text-muted mb-2 text-center">ชั่วโมง</p>
              <div className="h-32 overflow-y-auto scrollbar-thin">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectTime(h, minute || 0)}
                    className={cn(
                      "w-full py-1 text-sm text-center rounded transition-colors",
                      hour === h
                        ? "bg-primary text-white"
                        : "text-muted hover:text-surface-light hover:bg-white/10"
                    )}
                  >
                    {h.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1">
              <p className="text-xs text-muted mb-2 text-center">นาที</p>
              <div className="h-32 overflow-y-auto scrollbar-thin">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectTime(hour || 0, m)}
                    className={cn(
                      "w-full py-1 text-sm text-center rounded transition-colors",
                      minute === m
                        ? "bg-primary text-white"
                        : "text-muted hover:text-surface-light hover:bg-white/10"
                    )}
                  >
                    {m.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="mt-3 w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              ล้างเวลา
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

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
