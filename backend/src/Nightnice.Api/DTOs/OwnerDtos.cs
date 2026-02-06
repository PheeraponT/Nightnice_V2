namespace Nightnice.Api.DTOs;

// Owner can edit these fields only (NOT: Name, Slug, ProvinceId, CategoryIds, IsActive, IsFeatured, Lat/Long)
public record OwnerStoreUpdateDto(
    string? Description = null,
    string? Phone = null,
    string? Address = null,
    string? GoogleMapUrl = null,
    string? LineId = null,
    string? FacebookUrl = null,
    string? InstagramUrl = null,
    short? PriceRange = null,
    string? OpenTime = null,
    string? CloseTime = null,
    IEnumerable<string>? Facilities = null
);

// Owner store list item with key metrics
public record OwnerStoreListDto(
    Guid Id,
    string Name,
    string Slug,
    string? LogoUrl,
    string ProvinceName,
    IEnumerable<string> CategoryNames,
    bool IsActive,
    int ReviewCount,
    decimal? AverageRating,
    long ViewsLast30Days,
    DateTime CreatedAt
);

// Full owner store detail with analytics
public record OwnerStoreDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? LogoUrl,
    string? BannerUrl,
    string ProvinceName,
    IEnumerable<CategoryInfoDto> Categories,
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
    DateTime UpdatedAt,
    OwnerAnalyticsSummaryDto Analytics
);

public record OwnerAnalyticsSummaryDto(
    long ViewsTotal,
    long ViewsLast30Days,
    long ViewsLast7Days,
    int TotalReviews,
    decimal AverageRating,
    int FavoriteCount,
    string? PrimaryMood
);

public record OwnerViewAnalyticsDto(
    long TotalViews,
    IEnumerable<DailyViewDto> DailyViews
);

public record DailyViewDto(DateOnly Date, int ViewCount);

public record OwnerRatingAnalyticsDto(
    decimal AverageRating,
    int TotalReviews,
    int TotalRating5,
    int TotalRating4,
    int TotalRating3,
    int TotalRating2,
    int TotalRating1,
    IEnumerable<OwnerReviewSummaryDto> RecentReviews
);

public record OwnerReviewSummaryDto(
    Guid Id,
    string? UserDisplayName,
    short Rating,
    string? Title,
    string ContentPreview,
    string? OwnerReply,
    DateTime? OwnerReplyAt,
    DateTime CreatedAt
);

public record OwnerReviewReplyDto(string Reply);
