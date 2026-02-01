// Facilities available for stores
export const FACILITIES = [
  { key: "parking", label: "ที่จอดรถ", icon: "🅿️" },
  { key: "live_music", label: "ดนตรีสด", icon: "🎵" },
  { key: "karaoke", label: "คาราโอเกะ", icon: "🎤" },
  { key: "outdoor_seating", label: "ที่นั่งกลางแจ้ง", icon: "🌳" },
  { key: "wifi", label: "WiFi", icon: "📶" },
  { key: "reservation", label: "รับจอง", icon: "📅" },
] as const;

export type FacilityKey = (typeof FACILITIES)[number]["key"];

// Price range labels
export const PRICE_RANGES = [
  { value: 1, label: "$", description: "ราคาประหยัด" },
  { value: 2, label: "$$", description: "ราคาปานกลาง" },
  { value: 3, label: "$$$", description: "ราคาค่อนข้างสูง" },
  { value: 4, label: "$$$$", description: "ราคาพรีเมียม" },
] as const;

// Ad types
export const AD_TYPES = [
  { value: "banner", label: "Banner", description: "แบนเนอร์โฆษณาที่ด้านบนหน้า" },
  { value: "sponsored", label: "Sponsored", description: "การ์ดร้านค้าที่สปอนเซอร์" },
  { value: "featured", label: "Featured", description: "ร้านแนะนำพิเศษ" },
] as const;

// Site metadata
export const SITE_NAME = "Nightnice";
export const SITE_DESCRIPTION = "ค้นหาร้านกลางคืนชั้นนำในประเทศไทย - บาร์ ผับ ร้านเหล้า ร้านอาหารกลางคืน";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nightnice.life";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Nearby stores config
export const NEARBY_RADIUS_KM = 5;
export const NEARBY_LIMIT = 6;

// Image sizes
export const IMAGE_SIZES = {
  logo: { width: 200, height: 200 },
  banner: { width: 1200, height: 400 },
  gallery: { width: 800, height: 600 },
  thumbnail: { width: 400, height: 300 },
} as const;

// Colors (from Constitution II)
export const COLORS = {
  primary: "#EB1046",
  accent: "#6729FF",
  accentLight: "#E1BDFF",
  dark: "#101828",
  darkLighter: "#2B3139",
  muted: "#636771",
  textMuted: "#C5CBD9",
  success: "#21BF73",
  warning: "#EDAD4F",
  error: "#FF384F",
  errorLight: "#DA5F6D",
  surfaceDark: "#1C1C1C",
  surfaceLight: "#F2F2F2",
} as const;
