const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
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
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

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
};
