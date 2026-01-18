namespace Nightnice.Api.DTOs;

// T096: Advertisement DTOs for targeted ads display
public record AdListDto(
    Guid Id,
    string Title,
    string? ImageUrl,
    string? TargetUrl,
    string AdType, // "banner", "sponsored_store", "featured"
    Guid? StoreId,
    string? StoreName,
    string? StoreSlug,
    string? StoreLogoUrl,
    int Priority
);

public record AdTargetingParams(
    string? ProvinceSlug = null,
    string? CategorySlug = null,
    string? AdType = null,
    int Limit = 5
);

public record AdTrackingDto(
    Guid AdId,
    string EventType, // "impression" or "click"
    string? PageUrl,
    string? UserAgent
);

public record AdTrackingResponse(
    bool Success,
    string Message
);

// T138: Admin ad DTOs
public record AdCreateDto(
    string AdType,
    Guid? StoreId,
    string? Title,
    string? ImageUrl,
    string? TargetUrl,
    IEnumerable<Guid>? TargetProvinces,
    IEnumerable<Guid>? TargetCategories,
    DateOnly StartDate,
    DateOnly EndDate,
    bool IsActive = true,
    int Priority = 0
);

public record AdUpdateDto(
    string? AdType = null,
    Guid? StoreId = null,
    string? Title = null,
    string? ImageUrl = null,
    string? TargetUrl = null,
    IEnumerable<Guid>? TargetProvinces = null,
    IEnumerable<Guid>? TargetCategories = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    bool? IsActive = null,
    int? Priority = null
);

public record AdminAdListDto(
    Guid Id,
    string AdType,
    string? Title,
    Guid? StoreId,
    string? StoreName,
    string? ImageUrl,
    DateOnly StartDate,
    DateOnly EndDate,
    bool IsActive,
    int Priority,
    int ImpressionCount,
    int ClickCount,
    DateTime CreatedAt
);

public record AdminAdDto(
    Guid Id,
    string AdType,
    string? Title,
    Guid? StoreId,
    string? StoreName,
    string? ImageUrl,
    string? TargetUrl,
    IEnumerable<Guid> TargetProvinces,
    IEnumerable<Guid> TargetCategories,
    DateOnly StartDate,
    DateOnly EndDate,
    bool IsActive,
    int Priority,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// T139: Ad metrics DTOs
public record AdMetricsSummaryDto(
    Guid AdId,
    string? Title,
    int TotalImpressions,
    int TotalClicks,
    double ClickThroughRate,
    IEnumerable<DailyMetricDto> DailyMetrics
);

public record DailyMetricDto(
    DateOnly Date,
    int Impressions,
    int Clicks
);

// T143: Contact inquiry for admin view
public record AdminContactDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string InquiryType,
    string Message,
    string? StoreName,
    string? PackageInterest,
    bool IsRead,
    DateTime CreatedAt
);
