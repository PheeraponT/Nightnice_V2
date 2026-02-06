const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, token, cache, revalidate } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  if (cache) {
    fetchOptions.cache = cache;
  }

  if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Type definitions for API responses
interface StoreSearchParams {
  q?: string;
  province?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  lat?: number;
  lng?: number;
  sortByDistance?: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StoreListDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
  categoryNames: string[];
  priceRange: number | null;
  openTime: string | null;
  closeTime: string | null;
  isFeatured: boolean;
  distanceKm: number | null;
}

interface StoreDetailDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  images: StoreImageDto[];
  provinceName: string | null;
  provinceSlug: string | null;
  regionName: string | null;
  regionSlug: string | null;
  categories: CategoryInfoDto[];
  address: string | null;
  googleMapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  lineId: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  priceRange: number | null;
  openTime: string | null;
  closeTime: string | null;
  facilities: string[];
  isFeatured: boolean;
  createdAt: string;
  moodInsight: StoreMoodInsightDto | null;
}

interface StoreMoodInsightDto {
  totalResponses: number;
  primaryMood: string | null;
  secondaryMood: string | null;
  primaryMatchScore: number;
  moodScores: StoreMoodScoreDto[];
  vibeScores: StoreVibeScoreDto[];
  highlightQuote: string | null;
  lastSubmittedAt: string | null;
}

interface StoreMoodScoreDto {
  moodCode: string;
  percentage: number;
  votes: number;
}

interface StoreVibeScoreDto {
  dimension: string;
  averageScore: number;
}

interface StoreImageDto {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

interface CategoryInfoDto {
  id: string;
  name: string;
  slug: string;
}

interface ProvinceDto {
  id: string;
  name: string;
  slug: string;
  regionName: string;
  regionSlug: string;
  storeCount: number;
}

interface ProvinceListDto {
  id: string;
  name: string;
  slug: string;
}

interface RegionWithProvincesDto {
  id: string;
  name: string;
  slug: string;
  provinces: ProvinceListDto[];
}

interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  storeCount: number;
}

// T069: Province detail for SEO landing pages
interface CategoryCountDto {
  id: string;
  name: string;
  slug: string;
  storeCount: number;
}

interface ProvinceDetailDto {
  id: string;
  name: string;
  slug: string;
  seoDescription: string | null;
  regionName: string;
  regionSlug: string;
  totalStoreCount: number;
  categoryCounts: CategoryCountDto[];
}

// T070: Category detail for SEO landing pages
interface ProvinceCountDto {
  id: string;
  name: string;
  slug: string;
  storeCount: number;
}

interface CategoryDetailDto {
  id: string;
  name: string;
  slug: string;
  totalStoreCount: number;
  provinceCounts: ProvinceCountDto[];
}

// T073: Regions list
interface RegionDto {
  id: string;
  name: string;
  slug: string;
  provinceCount: number;
  storeCount: number;
}

// T083: Nearby store with distance
interface NearbyStoreDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  firstImageUrl: string | null;
  provinceName: string | null;
  categoryNames: string[];
  priceRange: number | null;
  distanceKm: number;
}

// Store for map display with coordinates
interface StoreMapDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  provinceName: string | null;
  categoryNames: string[];
  priceRange: number | null;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
  openTime: string | null;
  closeTime: string | null;
}

// T088: Contact inquiry
interface ContactInquiryDto {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  storeName?: string;
  packageInterest?: string;
}

interface ContactInquiryResponse {
  success: boolean;
  message: string;
  referenceId?: string;
}

// T096: Advertisement DTOs
interface AdListDto {
  id: string;
  title: string;
  imageUrl: string | null;
  targetUrl: string | null;
  adType: string;
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  storeLogoUrl: string | null;
  priority: number;
}

interface AdTargetingParams {
  province?: string;
  category?: string;
  type?: string;
  limit?: number;
}

interface AdTrackingDto {
  adId: string;
  eventType: "impression" | "click";
  pageUrl?: string;
  userAgent?: string;
}

interface AdTrackingResponse {
  success: boolean;
  message: string;
}

// T111: Auth types
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AdminUserDto;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AdminUserDto {
  id: string;
  username: string;
  email: string;
}

// T114: Admin store types
interface AdminStoreSearchParams {
  query?: string;
  provinceId?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

interface AdminStoreListDto {
  id: string;
  name: string;
  slug: string;
  provinceName: string;
  categoryNames: string[];
  isActive: boolean;
  isFeatured: boolean;
  imageCount: number;
  createdAt: string;
}

// Lightweight store for dropdown selection
interface StoreDropdownDto {
  id: string;
  name: string;
  provinceName: string | null;
  isActive: boolean;
}

interface AdminStoreDto {
  id: string;
  name: string;
  slug: string;
  provinceId: string;
  provinceName: string;
  categories: CategoryInfoDto[];
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapUrl: string | null;
  lineId: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  priceRange: number | null;
  openTime: string | null;
  closeTime: string | null;
  facilities: string[];
  images: StoreImageDto[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StoreCreateDto {
  name: string;
  provinceId: string;
  categoryIds: string[];
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  lineId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  priceRange?: number;
  openTime?: string;
  closeTime?: string;
  facilities?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

interface StoreUpdateDto {
  name?: string;
  provinceId?: string;
  categoryIds?: string[];
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  lineId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  priceRange?: number;
  openTime?: string;
  closeTime?: string;
  facilities?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

// T128: Admin province types
interface AdminProvinceDto {
  id: string;
  name: string;
  slug: string;
  seoDescription: string | null;
  sortOrder: number;
  regionId: string;
  regionName: string;
  storeCount: number;
}

interface ProvinceUpdateDto {
  seoDescription?: string;
  sortOrder?: number;
}

// T129: Admin category types
interface AdminCategoryDto {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string | null;
  sortOrder: number;
  storeCount: number;
}

interface CategoryCreateDto {
  name: string;
  iconEmoji?: string;
  sortOrder?: number;
}

interface CategoryUpdateDto {
  name?: string;
  iconEmoji?: string;
  sortOrder?: number;
}

// T144: Admin ad types
interface AdminAdListDto {
  id: string;
  adType: string;
  title: string | null;
  storeId: string | null;
  storeName: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: string;
}

interface AdminAdDto {
  id: string;
  adType: string;
  title: string | null;
  storeId: string | null;
  storeName: string | null;
  imageUrl: string | null;
  targetUrl: string | null;
  targetProvinces: string[];
  targetCategories: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface AdCreateDto {
  adType: string;
  storeId?: string;
  title?: string;
  imageUrl?: string;
  targetUrl?: string;
  targetProvinces?: string[];
  targetCategories?: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
  priority?: number;
}

interface AdUpdateDto {
  adType?: string;
  storeId?: string;
  title?: string;
  imageUrl?: string;
  targetUrl?: string;
  targetProvinces?: string[];
  targetCategories?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
}

// T145: Ad metrics types
interface DailyMetricDto {
  date: string;
  impressions: number;
  clicks: number;
}

interface AdMetricsSummaryDto {
  adId: string;
  title: string | null;
  totalImpressions: number;
  totalClicks: number;
  clickThroughRate: number;
  dailyMetrics: DailyMetricDto[];
}

// T150: Admin contact types
interface AdminContactDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiryType: string;
  message: string;
  storeName: string | null;
  packageInterest: string | null;
  isRead: boolean;
  createdAt: string;
}

// SEO pages types
interface PopularStoreDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
  categoryNames: string[];
  priceRange: number | null;
  openTime: string | null;
  closeTime: string | null;
  isFeatured: boolean;
  viewCount: number;
  weeklyViewCount: number;
}

interface LateNightStoreDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
  categoryNames: string[];
  priceRange: number | null;
  openTime: string;
  closeTime: string;
  isFeatured: boolean;
  isOpenPastMidnight: boolean;
}

interface ThemedStoreDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
  categoryNames: string[];
  facilities: string[];
  priceRange: number | null;
  openTime: string | null;
  closeTime: string | null;
  isFeatured: boolean;
}

interface ThemeDto {
  slug: string;
  titleTh: string;
  titleEn: string;
  description: string | null;
  icon: string | null;
  storeCount: number;
}

interface SeoPageMetaDto {
  title: string;
  description: string;
  totalCount: number;
  provinceCounts: ProvinceCountDto[] | null;
}

interface StoreViewTrackingResponse {
  success: boolean;
  message: string;
}

// Review types
interface ReviewUserDto {
  displayName: string;
  photoUrl?: string;
}

interface ReviewDto {
  id: string;
  storeId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  user: ReviewUserDto;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStatsDto {
  storeId: string;
  averageRating: number;
  totalReviews: number;
  totalRating5: number;
  totalRating4: number;
  totalRating3: number;
  totalRating2: number;
  totalRating1: number;
}

interface ReviewCreateDto {
  storeId: string;
  rating: number;
  title?: string;
  content: string;
  moodFeedback?: MoodFeedbackInputDto;
}

interface ReviewUpdateDto {
  rating?: number;
  title?: string;
  content?: string;
  moodFeedback?: MoodFeedbackInputDto;
}

interface MoodFeedbackInputDto {
  moodCode: string;
  energyScore: number;
  musicScore: number;
  crowdScore: number;
  conversationScore: number;
  creativityScore: number;
  serviceScore: number;
  highlightQuote?: string;
}

interface ReviewHelpfulToggleDto {
  reviewId: string;
}

interface ReviewReportDto {
  reviewId: string;
  reason: 'spam' | 'offensive' | 'fake' | 'inappropriate' | 'other';
  description?: string;
}

// Event types
interface EventSearchParams {
  q?: string;
  province?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

interface EventListDto {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  price: number | null;
  priceMax: number | null;
  isFeatured: boolean;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
}

interface EventDetailDto {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  price: number | null;
  priceMax: number | null;
  ticketUrl: string | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  isFeatured: boolean;
  createdAt: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl: string | null;
  storePhone: string | null;
  storeLineId: string | null;
  provinceName: string | null;
  provinceSlug: string | null;
  regionName: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapUrl: string | null;
}

interface EventCalendarDto {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  storeName: string;
  storeSlug: string;
  provinceSlug: string | null;
}

// Admin event types
interface AdminEventSearchParams {
  query?: string;
  storeId?: string;
  eventType?: string;
  page?: number;
  pageSize?: number;
}

interface AdminEventListDto {
  id: string;
  title: string;
  slug: string;
  eventType: string;
  storeName: string;
  provinceName: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface AdminEventDto {
  id: string;
  storeId: string;
  storeName: string;
  provinceName: string | null;
  title: string;
  slug: string;
  eventType: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  price: number | null;
  priceMax: number | null;
  ticketUrl: string | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventCreateDto {
  storeId: string;
  title: string;
  eventType: string;
  startDate: string;
  description?: string;
  imageUrl?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  priceMax?: number;
  ticketUrl?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface EventUpdateDto {
  storeId?: string;
  title?: string;
  eventType?: string;
  startDate?: string;
  description?: string;
  imageUrl?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  priceMax?: number;
  ticketUrl?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

// Public API endpoints
export const api = {
  public: {
    // Stores
    getStores: (params: StoreSearchParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.province) searchParams.set("province", params.province);
      if (params.category) searchParams.set("category", params.category);
      if (params.minPrice !== undefined) searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice !== undefined) searchParams.set("maxPrice", String(params.maxPrice));
      if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params.lat !== undefined) searchParams.set("lat", String(params.lat));
      if (params.lng !== undefined) searchParams.set("lng", String(params.lng));
      if (params.sortByDistance !== undefined) searchParams.set("sortByDistance", String(params.sortByDistance));

      const queryString = searchParams.toString();
      return request<PaginatedResponse<StoreListDto>>(`/stores${queryString ? `?${queryString}` : ""}`);
    },

    getFeaturedStores: (count: number = 6) =>
      request<StoreListDto[]>(`/stores/featured?count=${count}`),

    // Get stores by IDs (for favorites)
    getStoresByIds: (ids: string[]) =>
      request<StoreListDto[]>("/stores/by-ids", {
        method: "POST",
        body: { ids },
      }),

    getStoreBySlug: (slug: string) =>
      request<StoreDetailDto>(`/stores/${slug}`),

    getMoodInsight: (storeId: string) =>
      request<StoreMoodInsightDto | null>(`/stores/${storeId}/mood-insight`),

    submitMoodFeedback: (storeId: string, data: MoodFeedbackInputDto, token: string) =>
      request<{ message: string }>(`/stores/${storeId}/mood-feedback`, {
        method: "POST",
        body: data,
        token,
      }),

    // T082: Nearby stores
    getNearbyStores: (slug: string, radius: number = 5, count: number = 6) =>
      request<NearbyStoreDto[]>(`/stores/${slug}/nearby?radius=${radius}&count=${count}`),

    // Map stores
    getMapStores: (params?: { province?: string; category?: string; maxCount?: number; lat?: number; lng?: number; sortByDistance?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.province) searchParams.set("province", params.province);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.maxCount) searchParams.set("maxCount", String(params.maxCount));
      if (params?.lat !== undefined) searchParams.set("lat", String(params.lat));
      if (params?.lng !== undefined) searchParams.set("lng", String(params.lng));
      if (params?.sortByDistance !== undefined) searchParams.set("sortByDistance", String(params.sortByDistance));
      const queryString = searchParams.toString();
      return request<StoreMapDto[]>(`/stores/map${queryString ? `?${queryString}` : ""}`);
    },

    // Provinces
    getProvinces: () =>
      request<ProvinceDto[]>("/provinces"),

    getProvincesGrouped: () =>
      request<RegionWithProvincesDto[]>("/provinces/grouped"),

    getProvinceBySlug: (slug: string) =>
      request<ProvinceDto>(`/provinces/${slug}`),

    // T071: Province detail for SEO landing pages
    getProvinceDetail: (slug: string) =>
      request<ProvinceDetailDto>(`/provinces/${slug}/detail`),

    // T073: Regions list
    getRegions: () =>
      request<RegionDto[]>("/regions"),

    // Categories
    getCategories: () =>
      request<CategoryDto[]>("/categories"),

    getCategoryBySlug: (slug: string) =>
      request<CategoryDto>(`/categories/${slug}`),

    // T072: Category detail for SEO landing pages
    getCategoryDetail: (slug: string) =>
      request<CategoryDetailDto>(`/categories/${slug}/detail`),

    // T090: Contact inquiry
    submitContactInquiry: (data: ContactInquiryDto) =>
      request<ContactInquiryResponse>("/contact", { method: "POST", body: data }),

    // T099: Get targeted ads
    getAds: (params?: AdTargetingParams) => {
      const searchParams = new URLSearchParams();
      if (params?.province) searchParams.set("province", params.province);
      if (params?.category) searchParams.set("category", params.category);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const queryString = searchParams.toString();
      return request<AdListDto[]>(`/ads${queryString ? `?${queryString}` : ""}`);
    },

    // T100: Track ad event
    trackAdEvent: (data: AdTrackingDto) =>
      request<AdTrackingResponse>("/ads/track", { method: "POST", body: data }),

    // Events
    getEvents: (params: EventSearchParams = {}) => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.province) searchParams.set("province", params.province);
      if (params.eventType) searchParams.set("eventType", params.eventType);
      if (params.startDate) searchParams.set("startDate", params.startDate);
      if (params.endDate) searchParams.set("endDate", params.endDate);
      if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
      const queryString = searchParams.toString();
      return request<PaginatedResponse<EventListDto>>(`/events${queryString ? `?${queryString}` : ""}`);
    },

    getUpcomingEvents: (params?: { province?: string; eventType?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.province) searchParams.set("province", params.province);
      if (params?.eventType) searchParams.set("eventType", params.eventType);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const queryString = searchParams.toString();
      return request<EventListDto[]>(`/events/upcoming${queryString ? `?${queryString}` : ""}`);
    },

    getFeaturedEvents: (limit: number = 6) =>
      request<EventListDto[]>(`/events/featured?limit=${limit}`),

    getCalendarEvents: (year: number, month: number, province?: string) => {
      const searchParams = new URLSearchParams();
      searchParams.set("year", String(year));
      searchParams.set("month", String(month));
      if (province) searchParams.set("province", province);
      return request<EventCalendarDto[]>(`/events/calendar?${searchParams.toString()}`);
    },

    getEventBySlug: (slug: string) =>
      request<EventDetailDto>(`/events/${slug}`, { cache: "no-store" }),

    getStoreEvents: (storeSlug: string, upcoming: boolean = true, limit: number = 10) =>
      request<EventListDto[]>(`/events/store/${storeSlug}?upcoming=${upcoming}&limit=${limit}`),

    // Reviews
    getStoreReviews: (storeId: string, params?: { page?: number; pageSize?: number; sortBy?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
      const queryString = searchParams.toString();
      return request<PaginatedResponse<ReviewDto>>(`/reviews/store/${storeId}${queryString ? `?${queryString}` : ""}`);
    },

    getReviewStats: (storeId: string) =>
      request<ReviewStatsDto>(`/reviews/store/${storeId}/stats`),

    createReview: (data: ReviewCreateDto, token: string) =>
      request<ReviewDto>("/reviews", { method: "POST", body: data, token }),

    updateReview: (reviewId: string, data: ReviewUpdateDto, token: string) =>
      request<ReviewDto>(`/reviews/${reviewId}`, { method: "PUT", body: data, token }),

    deleteReview: (reviewId: string, token: string) =>
      request<{ message: string }>(`/reviews/${reviewId}`, { method: "DELETE", token }),

    toggleHelpful: (reviewId: string, token: string) =>
      request<{ isHelpful: boolean }>("/reviews/helpful", {
        method: "POST",
        body: { reviewId },
        token,
      }),

    reportReview: (data: ReviewReportDto, token: string) =>
      request<{ message: string }>("/reviews/report", { method: "POST", body: data, token }),

    // SEO pages
    trackStoreView: (storeId: string, referrer?: string) =>
      request<StoreViewTrackingResponse>("/seo/track-view", {
        method: "POST",
        body: { storeId, referrer },
      }),

    getPopularStores: (provinceSlug?: string, count: number = 24) => {
      const path = provinceSlug ? `/seo/popular/${provinceSlug}` : "/seo/popular";
      return request<PopularStoreDto[]>(`${path}?count=${count}`);
    },

    getPopularPageMeta: (provinceSlug?: string) => {
      const path = provinceSlug ? `/seo/popular-meta/${provinceSlug}` : "/seo/popular-meta";
      return request<SeoPageMetaDto>(path);
    },

    getLateNightStores: (provinceSlug?: string, count: number = 24) => {
      const path = provinceSlug ? `/seo/late-night/${provinceSlug}` : "/seo/late-night";
      return request<LateNightStoreDto[]>(`${path}?count=${count}`);
    },

    getLateNightPageMeta: (provinceSlug?: string) => {
      const path = provinceSlug ? `/seo/late-night-meta/${provinceSlug}` : "/seo/late-night-meta";
      return request<SeoPageMetaDto>(path);
    },

    getThemes: () =>
      request<ThemeDto[]>("/seo/themes"),

    getThemedStores: (themeSlug: string, provinceSlug?: string, count: number = 24) => {
      const path = provinceSlug
        ? `/seo/theme/${themeSlug}/${provinceSlug}`
        : `/seo/theme/${themeSlug}`;
      return request<ThemedStoreDto[]>(`${path}?count=${count}`);
    },
  },

  // Admin API endpoints (require authentication)
  admin: {
    // T113: Auth
    login: (data: { username: string; password: string }) =>
      request<LoginResponse>("/admin/login", { method: "POST", body: data }),

    refreshToken: (refreshToken: string) =>
      request<RefreshTokenResponse>("/admin/refresh", {
        method: "POST",
        body: { refreshToken },
      }),

    logout: (refreshToken: string) =>
      request<{ message: string }>("/admin/logout", {
        method: "POST",
        body: { refreshToken },
      }),

    getCurrentUser: (token: string) =>
      request<AdminUserDto>("/admin/me", { token }),

    // T116: Stores (admin)
    getStores: (token: string, params?: AdminStoreSearchParams) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set("query", params.query);
      if (params?.provinceId) searchParams.set("provinceId", params.provinceId);
      if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
      if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive));
      if (params?.isFeatured !== undefined) searchParams.set("isFeatured", String(params.isFeatured));
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
      const queryString = searchParams.toString();
      return request<PaginatedResponse<AdminStoreListDto>>(
        `/admin/stores${queryString ? `?${queryString}` : ""}`,
        { token }
      );
    },

    // Get all stores for dropdown (no pagination)
    getStoresForDropdown: (token: string) =>
      request<StoreDropdownDto[]>("/admin/stores/dropdown", { token }),

    getStore: (token: string, id: string) =>
      request<AdminStoreDto>(`/admin/stores/${id}`, { token }),

    createStore: (token: string, data: StoreCreateDto) =>
      request<AdminStoreDto>("/admin/stores", { method: "POST", body: data, token }),

    updateStore: (token: string, id: string, data: StoreUpdateDto) =>
      request<AdminStoreDto>(`/admin/stores/${id}`, { method: "PUT", body: data, token }),

    deleteStore: (token: string, id: string) =>
      request<{ message: string }>(`/admin/stores/${id}`, { method: "DELETE", token }),

    // T117: Store images
    uploadStoreImage: async (token: string, storeId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/admin/stores/${storeId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
      }

      return response.json() as Promise<StoreImageDto>;
    },

    deleteStoreImage: (token: string, storeId: string, imageId: string) =>
      request<{ message: string }>(`/admin/stores/${storeId}/images/${imageId}`, {
        method: "DELETE",
        token,
      }),

    // T130: Provinces (admin)
    getProvinces: (token: string) =>
      request<AdminProvinceDto[]>("/admin/provinces", { token }),

    getProvince: (token: string, id: string) =>
      request<AdminProvinceDto>(`/admin/provinces/${id}`, { token }),

    updateProvince: (token: string, id: string, data: ProvinceUpdateDto) =>
      request<AdminProvinceDto>(`/admin/provinces/${id}`, { method: "PUT", body: data, token }),

    // T131: Categories (admin)
    getCategories: (token: string) =>
      request<AdminCategoryDto[]>("/admin/categories", { token }),

    getCategory: (token: string, id: string) =>
      request<AdminCategoryDto>(`/admin/categories/${id}`, { token }),

    createCategory: (token: string, data: CategoryCreateDto) =>
      request<AdminCategoryDto>("/admin/categories", { method: "POST", body: data, token }),

    updateCategory: (token: string, id: string, data: CategoryUpdateDto) =>
      request<AdminCategoryDto>(`/admin/categories/${id}`, { method: "PUT", body: data, token }),

    deleteCategory: (token: string, id: string) =>
      request<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE", token }),

    // T144: Ads (admin)
    getAds: (token: string) =>
      request<AdminAdListDto[]>("/admin/ads", { token }),

    getAd: (token: string, id: string) =>
      request<AdminAdDto>(`/admin/ads/${id}`, { token }),

    createAd: (token: string, data: AdCreateDto) =>
      request<AdminAdDto>("/admin/ads", { method: "POST", body: data, token }),

    updateAd: (token: string, id: string, data: AdUpdateDto) =>
      request<AdminAdDto>(`/admin/ads/${id}`, { method: "PUT", body: data, token }),

    deleteAd: (token: string, id: string) =>
      request<{ message: string }>(`/admin/ads/${id}`, { method: "DELETE", token }),

    // T145: Ad metrics
    getAdMetrics: (token: string, id: string, days?: number) => {
      const queryString = days ? `?days=${days}` : "";
      return request<AdMetricsSummaryDto>(`/admin/ads/${id}/metrics${queryString}`, { token });
    },

    // T146: Ad image upload
    uploadAdImage: async (token: string, adId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/admin/ads/${adId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
      }

      return response.json() as Promise<{ imageUrl: string }>;
    },

    // T150: Contacts (admin)
    getContacts: (token: string) =>
      request<AdminContactDto[]>("/admin/contacts", { token }),

    getContact: (token: string, id: string) =>
      request<AdminContactDto>(`/admin/contacts/${id}`, { token }),

    markContactAsRead: (token: string, id: string) =>
      request<{ message: string }>(`/admin/contacts/${id}/read`, { method: "PUT", token }),

    deleteContact: (token: string, id: string) =>
      request<{ message: string }>(`/admin/contacts/${id}`, { method: "DELETE", token }),

    getUnreadContactCount: (token: string) =>
      request<{ count: number }>("/admin/contacts/unread-count", { token }),

    // Events (admin)
    getEvents: (token: string, params?: AdminEventSearchParams) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set("query", params.query);
      if (params?.storeId) searchParams.set("storeId", params.storeId);
      if (params?.eventType) searchParams.set("eventType", params.eventType);
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
      const queryString = searchParams.toString();
      return request<PaginatedResponse<AdminEventListDto>>(
        `/admin/events${queryString ? `?${queryString}` : ""}`,
        { token }
      );
    },

    getEvent: (token: string, id: string) =>
      request<AdminEventDto>(`/admin/events/${id}`, { token }),

    createEvent: (token: string, data: EventCreateDto) =>
      request<AdminEventDto>("/admin/events", { method: "POST", body: data, token }),

    updateEvent: (token: string, id: string, data: EventUpdateDto) =>
      request<AdminEventDto>(`/admin/events/${id}`, { method: "PUT", body: data, token }),

    deleteEvent: (token: string, id: string) =>
      request<{ message: string }>(`/admin/events/${id}`, { method: "DELETE", token }),

    uploadEventImage: async (token: string, eventId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/admin/events/${eventId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
      }

      return response.json() as Promise<{ imageUrl: string }>;
    },
  },
};

export { ApiError };
export type {
  StoreSearchParams,
  PaginatedResponse,
  StoreListDto,
  StoreDetailDto,
  StoreImageDto,
  CategoryInfoDto,
  ProvinceDto,
  ProvinceListDto,
  RegionWithProvincesDto,
  CategoryDto,
  // SEO landing page types
  CategoryCountDto,
  ProvinceDetailDto,
  ProvinceCountDto,
  CategoryDetailDto,
  RegionDto,
  // Nearby stores
  NearbyStoreDto,
  // Map stores
  StoreMapDto,
  // Contact
  ContactInquiryDto,
  ContactInquiryResponse,
  // Ads
  AdListDto,
  AdTargetingParams,
  AdTrackingDto,
  AdTrackingResponse,
  // Admin auth
  LoginResponse,
  RefreshTokenResponse,
  AdminUserDto,
  // Admin stores
  AdminStoreSearchParams,
  AdminStoreListDto,
  AdminStoreDto,
  StoreDropdownDto,
  StoreCreateDto,
  StoreUpdateDto,
  // Admin provinces
  AdminProvinceDto,
  ProvinceUpdateDto,
  // Admin categories
  AdminCategoryDto,
  CategoryCreateDto,
  CategoryUpdateDto,
  // Admin ads
  AdminAdListDto,
  AdminAdDto,
  AdCreateDto,
  AdUpdateDto,
  AdMetricsSummaryDto,
  DailyMetricDto,
  // Admin contacts
  AdminContactDto,
  // SEO pages
  PopularStoreDto,
  LateNightStoreDto,
  ThemedStoreDto,
  ThemeDto,
  SeoPageMetaDto,
  StoreViewTrackingResponse,
  StoreMoodInsightDto,
  StoreMoodScoreDto,
  StoreVibeScoreDto,
  // Reviews
  ReviewUserDto,
  ReviewDto,
  ReviewStatsDto,
  ReviewCreateDto,
  ReviewUpdateDto,
  ReviewHelpfulToggleDto,
  ReviewReportDto,
  MoodFeedbackInputDto,
  // Events
  EventSearchParams,
  EventListDto,
  EventDetailDto,
  EventCalendarDto,
  // Admin events
  AdminEventSearchParams,
  AdminEventListDto,
  AdminEventDto,
  EventCreateDto,
  EventUpdateDto,
};
