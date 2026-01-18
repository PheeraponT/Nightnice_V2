// Common types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Region & Province
export interface RegionRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProvinceRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProvinceWithCount extends ProvinceRef {
  store_count: number;
}

export interface RegionWithProvinces {
  id: string;
  name: string;
  slug: string;
  provinces: ProvinceWithCount[];
}

export interface ProvinceListResponse {
  data: RegionWithProvinces[];
}

export interface CategoryCount {
  category: CategoryRef;
  count: number;
}

export interface ProvinceDetailResponse {
  id: string;
  name: string;
  slug: string;
  seo_description: string | null;
  region: RegionRef;
  category_counts: CategoryCount[];
}

export interface RegionListResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    province_count: number;
  }>;
}

// Category
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithCount extends CategoryRef {
  store_count: number;
}

export interface CategoryListResponse {
  data: CategoryWithCount[];
}

export interface ProvinceCount {
  province: ProvinceRef;
  count: number;
}

export interface CategoryDetailResponse {
  id: string;
  name: string;
  slug: string;
  province_counts: ProvinceCount[];
}

// Store
export interface StoreImageRef {
  id: string;
  url: string;
  sort_order: number;
}

export interface StoreListItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  province: ProvinceRef;
  categories: CategoryRef[];
  price_range: number | null;
  is_featured: boolean;
}

export interface StoreListResponse {
  data: StoreListItem[];
  meta: PaginationMeta;
}

export interface StoreDetailResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  google_map_url: string | null;
  line_id: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  price_range: number | null;
  open_time: string | null;
  close_time: string | null;
  facilities: string[];
  is_featured: boolean;
  province: ProvinceRef;
  categories: CategoryRef[];
  gallery: StoreImageRef[];
}

export interface NearbyStoreItem extends StoreListItem {
  distance_km: number;
}

export interface NearbyStoresResponse {
  data: NearbyStoreItem[];
}

// Advertisement
export type AdType = "banner" | "sponsored" | "featured";

export interface AdListItem {
  id: string;
  type: AdType;
  image_url: string | null;
  target_url: string | null;
  store: StoreListItem | null;
}

export interface AdListResponse {
  banners: AdListItem[];
  sponsored: AdListItem[];
  featured: AdListItem[];
}

export interface AdTrackRequest {
  ad_id: string;
  event_type: "impression" | "click";
  page_context?: string;
}

// Contact
export interface ContactRequest {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  message: string;
}

export interface ContactListItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ContactListResponse {
  data: ContactListItem[];
  meta: PaginationMeta;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface RefreshRequest {
  refresh_token: string;
}

// Admin Store
export interface AdminStoreResponse extends StoreDetailResponse {
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStoreListItem extends StoreListItem {
  is_active: boolean;
  created_at: string;
}

export interface AdminStoreListResponse {
  data: AdminStoreListItem[];
  meta: PaginationMeta;
}

export interface StoreCreateRequest {
  name: string;
  province_id: string;
  category_ids: string[];
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  google_map_url?: string | null;
  line_id?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  price_range?: number | null;
  open_time?: string | null;
  close_time?: string | null;
  facilities?: string[];
  is_active?: boolean;
  is_featured?: boolean;
}

export interface StoreUpdateRequest extends Partial<StoreCreateRequest> {}

export interface ImageUploadResponse {
  url: string;
  id?: string;
}

// Admin Province
export interface AdminProvinceResponse extends ProvinceDetailResponse {
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProvinceListResponse {
  data: AdminProvinceResponse[];
}

export interface ProvinceUpdateRequest {
  seo_description?: string | null;
  sort_order?: number;
}

// Admin Category
export interface AdminCategoryResponse extends CategoryRef {
  sort_order: number;
  store_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCategoryListResponse {
  data: AdminCategoryResponse[];
}

export interface CategoryCreateRequest {
  name: string;
  sort_order?: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  sort_order?: number;
}

// Admin Advertisement
export interface AdminAdResponse {
  id: string;
  type: AdType;
  store: StoreListItem | null;
  image_url: string | null;
  target_url: string | null;
  target_provinces: ProvinceRef[];
  target_categories: CategoryRef[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAdDetailResponse extends AdminAdResponse {
  metrics_summary: {
    total_impressions: number;
    total_clicks: number;
    ctr: number;
  };
}

export interface AdminAdListResponse {
  data: AdminAdResponse[];
  meta: PaginationMeta;
}

export interface AdCreateRequest {
  type: AdType;
  store_id?: string | null;
  target_url?: string | null;
  target_provinces?: string[];
  target_categories?: string[];
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface AdUpdateRequest extends Partial<Omit<AdCreateRequest, "type">> {}

export interface AdMetricsResponse {
  ad_id: string;
  period: {
    from: string;
    to: string;
  };
  total_impressions: number;
  total_clicks: number;
  ctr: number;
  daily: Array<{
    date: string;
    impressions: number;
    clicks: number;
  }>;
}
