import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the API base URL (without /api path)
 */
export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";
  return apiUrl.replace(/\/api$/, "");
}

/**
 * Resolve image URL - converts relative paths to absolute URLs
 * Handles both API uploads (/uploads/...) and external URLs (https://...)
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // If already absolute URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If relative path starting with /, prepend API base URL
  if (url.startsWith("/")) {
    return `${getApiBaseUrl()}${url}`;
  }

  return url;
}

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format price range (1-4) to display string
 */
export function formatPriceRange(priceRange: number | null): string {
  if (!priceRange) return "";
  return "$".repeat(priceRange);
}

/**
 * Format operating hours (supports overnight)
 */
export function formatOperatingHours(
  openTime: string | null,
  closeTime: string | null
): string {
  if (!openTime || !closeTime) return "ไม่ระบุเวลา";
  return `${openTime} - ${closeTime}`;
}

/**
 * Format date to Thai locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format datetime to Thai locale
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format number with Thai locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("th-TH");
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Validate Thai phone number format
 */
export function isValidThaiPhone(phone: string): boolean {
  return /^0[0-9]{8,9}$/.test(phone);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance in kilometers
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

/**
 * Get facility label by key
 */
export function getFacilityLabel(key: string): string {
  const labels: Record<string, string> = {
    parking: "ที่จอดรถ",
    live_music: "ดนตรีสด",
    karaoke: "คาราโอเกะ",
    outdoor_seating: "ที่นั่งกลางแจ้ง",
    wifi: "WiFi",
    reservation: "รับจอง",
  };
  return labels[key] || key;
}

/**
 * Build search params from object
 */
export function buildSearchParams(
  params: Record<string, string | number | boolean | undefined>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Store opening hours utilities
 */
export interface StoreOpenStatus {
  isOpen: boolean;
  statusText: string;
  timeUntilChange: number | null; // minutes until open/close
  timeUntilChangeText: string | null;
}

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if store is currently open (handles overnight hours)
 */
export function checkIfOpen(openTime?: string | null, closeTime?: string | null): boolean {
  if (!openTime || !closeTime) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);

  // Handle overnight hours (e.g., 20:00 - 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

/**
 * Get detailed store open status with time until change
 */
export function getStoreOpenStatus(openTime?: string | null, closeTime?: string | null): StoreOpenStatus {
  if (!openTime || !closeTime) {
    return {
      isOpen: false,
      statusText: "ไม่ระบุเวลา",
      timeUntilChange: null,
      timeUntilChangeText: null,
    };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);

  const isOvernight = closeMinutes < openMinutes;
  let isOpen: boolean;
  let minutesUntilChange: number;

  if (isOvernight) {
    // Overnight hours (e.g., 20:00 - 02:00)
    isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;

    if (isOpen) {
      // Calculate time until closing
      if (currentMinutes >= openMinutes) {
        // After opening, before midnight
        minutesUntilChange = (24 * 60 - currentMinutes) + closeMinutes;
      } else {
        // After midnight, before closing
        minutesUntilChange = closeMinutes - currentMinutes;
      }
    } else {
      // Calculate time until opening
      minutesUntilChange = openMinutes - currentMinutes;
    }
  } else {
    // Regular hours (e.g., 10:00 - 22:00)
    isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

    if (isOpen) {
      minutesUntilChange = closeMinutes - currentMinutes;
    } else if (currentMinutes < openMinutes) {
      minutesUntilChange = openMinutes - currentMinutes;
    } else {
      // After closing, calculate time until next opening (next day)
      minutesUntilChange = (24 * 60 - currentMinutes) + openMinutes;
    }
  }

  const timeUntilChangeText = formatMinutesToTimeText(minutesUntilChange, isOpen);

  return {
    isOpen,
    statusText: isOpen ? "เปิดอยู่" : "ปิดแล้ว",
    timeUntilChange: minutesUntilChange,
    timeUntilChangeText,
  };
}

/**
 * Format minutes to human-readable Thai text
 */
function formatMinutesToTimeText(minutes: number, isOpen: boolean): string {
  const action = isOpen ? "ปิดใน" : "เปิดใน";

  if (minutes < 60) {
    return `${action} ${minutes} นาที`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours >= 24) {
    return isOpen ? "เปิดอยู่" : "ปิดแล้ว";
  }

  if (remainingMinutes === 0) {
    return `${action} ${hours} ชม.`;
  }

  return `${action} ${hours} ชม. ${remainingMinutes} นาที`;
}
