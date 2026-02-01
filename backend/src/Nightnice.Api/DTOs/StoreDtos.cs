namespace Nightnice.Api.DTOs;

public record StoreListDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string? ProvinceName,
    string? ProvinceSlug,
    IEnumerable<string> CategoryNames,
    short? PriceRange,
    string? OpenTime,
    string? CloseTime,
    bool IsFeatured,
    double? DistanceKm = null
);

public record StoreDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    IEnumerable<StoreImageDto> Images,
    string? ProvinceName,
    string? ProvinceSlug,
    string? RegionName,
    string? RegionSlug,
    IEnumerable<CategoryInfoDto> Categories,
    string? Address,
    string? GoogleMapUrl,
    decimal? Latitude,
    decimal? Longitude,
    string? Phone,
    string? LineId,
    string? FacebookUrl,
    string? InstagramUrl,
    short? PriceRange,
    string? OpenTime,
    string? CloseTime,
    IEnumerable<string> Facilities,
    bool IsFeatured,
    DateTime CreatedAt
);

public record StoreImageDto(
    Guid Id,
    string ImageUrl,
    string? AltText,
    int SortOrder
);

public record CategoryInfoDto(
    Guid Id,
    string Name,
    string Slug
);

public record StoreSearchParams(
    string? Query = null,
    string? ProvinceSlug = null,
    string? CategorySlug = null,
    short? MinPrice = null,
    short? MaxPrice = null,
    bool? IsFeatured = null,
    int Page = 1,
    int PageSize = 12,
    decimal? UserLatitude = null,
    decimal? UserLongitude = null,
    bool SortByDistance = false
);

public record PaginatedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

// T083: Nearby store with distance for store detail page
public record NearbyStoreDto(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    string? BannerUrl,
    string? FirstImageUrl,
    string? ProvinceName,
    IEnumerable<string> CategoryNames,
    short? PriceRange,
    double DistanceKm
);

// T114: Admin store DTOs for CRUD operations
public record StoreCreateDto(
    string Name,
    Guid ProvinceId,
    IEnumerable<Guid> CategoryIds,
    string? Description = null,
    string? LogoUrl = null,
    string? BannerUrl = null,
    string? Phone = null,
    string? Address = null,
    decimal? Latitude = null,
    decimal? Longitude = null,
    string? GoogleMapUrl = null,
    string? LineId = null,
    string? FacebookUrl = null,
    string? InstagramUrl = null,
    short? PriceRange = null,
    string? OpenTime = null,
    string? CloseTime = null,
    IEnumerable<string>? Facilities = null,
    bool IsActive = true,
    bool IsFeatured = false
);

public record StoreUpdateDto(
    string? Name = null,
    Guid? ProvinceId = null,
    IEnumerable<Guid>? CategoryIds = null,
    string? Description = null,
    string? LogoUrl = null,
    string? BannerUrl = null,
    string? Phone = null,
    string? Address = null,
    decimal? Latitude = null,
    decimal? Longitude = null,
    string? GoogleMapUrl = null,
    string? LineId = null,
    string? FacebookUrl = null,
    string? InstagramUrl = null,
    short? PriceRange = null,
    string? OpenTime = null,
    string? CloseTime = null,
    IEnumerable<string>? Facilities = null,
    bool? IsActive = null,
    bool? IsFeatured = null
);

// Admin store detail with all fields
public record AdminStoreDto(
    Guid Id,
    string Name,
    string Slug,
    Guid ProvinceId,
    string ProvinceName,
    IEnumerable<CategoryInfoDto> Categories,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string? Phone,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? GoogleMapUrl,
    string? LineId,
    string? FacebookUrl,
    string? InstagramUrl,
    short? PriceRange,
    string? OpenTime,
    string? CloseTime,
    IEnumerable<string> Facilities,
    IEnumerable<StoreImageDto> Images,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// Admin store list item
public record AdminStoreListDto(
    Guid Id,
    string Name,
    string Slug,
    string ProvinceName,
    IEnumerable<string> CategoryNames,
    bool IsActive,
    bool IsFeatured,
    int ImageCount,
    DateTime CreatedAt
);

// Store for map display with coordinates
public record StoreMapDto(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    string? BannerUrl,
    string? ProvinceName,
    IEnumerable<string> CategoryNames,
    short? PriceRange,
    decimal Latitude,
    decimal Longitude,
    double? DistanceKm = null,
    string? OpenTime = null,
    string? CloseTime = null
);

// Lightweight store for dropdown selection
public record StoreDropdownDto(
    Guid Id,
    string Name,
    string? ProvinceName,
    bool IsActive
);

// SEO Pages DTOs

// View tracking request
public record StoreViewTrackingDto(
    Guid StoreId,
    string? Referrer = null
);

// Response for tracking
public record StoreViewTrackingResponse(
    bool Success,
    string Message
);

// Popular stores with view count (for SEO pages)
public record PopularStoreDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string? ProvinceName,
    string? ProvinceSlug,
    IEnumerable<string> CategoryNames,
    short? PriceRange,
    string? OpenTime,
    string? CloseTime,
    bool IsFeatured,
    long ViewCount,
    long WeeklyViewCount
);

// Late-night stores
public record LateNightStoreDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string? ProvinceName,
    string? ProvinceSlug,
    IEnumerable<string> CategoryNames,
    short? PriceRange,
    string OpenTime,
    string CloseTime,
    bool IsFeatured,
    bool IsOpenPastMidnight
);

// Themed collection store
public record ThemedStoreDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string? ProvinceName,
    string? ProvinceSlug,
    IEnumerable<string> CategoryNames,
    IEnumerable<string> Facilities,
    short? PriceRange,
    string? OpenTime,
    string? CloseTime,
    bool IsFeatured
);

// Theme definition for list
public record ThemeDto(
    string Slug,
    string TitleTh,
    string TitleEn,
    string? Description,
    string? Icon,
    int StoreCount
);

// SEO page with province counts (uses ProvinceCountDto from CategoryDtos.cs)
public record SeoPageMetaDto(
    string Title,
    string Description,
    int TotalCount,
    IEnumerable<ProvinceCountDto>? ProvinceCounts = null
);
