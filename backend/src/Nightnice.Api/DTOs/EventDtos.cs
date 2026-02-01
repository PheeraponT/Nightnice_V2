namespace Nightnice.Api.DTOs;

// Public: Event list item
public record EventListDto(
    Guid Id,
    string Title,
    string Slug,
    string EventType,
    string? ImageUrl,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? StartTime,
    string? EndTime,
    decimal? Price,
    decimal? PriceMax,
    bool IsFeatured,
    // Store info
    Guid StoreId,
    string StoreName,
    string StoreSlug,
    string? StoreLogoUrl,
    string? ProvinceName,
    string? ProvinceSlug
);

// Public: Event detail
public record EventDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string EventType,
    string? Description,
    string? ImageUrl,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? StartTime,
    string? EndTime,
    decimal? Price,
    decimal? PriceMax,
    string? TicketUrl,
    bool IsRecurring,
    string? RecurrencePattern,
    bool IsFeatured,
    DateTime CreatedAt,
    // Store info
    Guid StoreId,
    string StoreName,
    string StoreSlug,
    string? StoreLogoUrl,
    string? StorePhone,
    string? StoreLineId,
    string? ProvinceName,
    string? ProvinceSlug,
    string? RegionName,
    decimal? Latitude,
    decimal? Longitude,
    string? GoogleMapUrl
);

// Public: Event search params
public record EventSearchParams(
    string? Query = null,
    string? ProvinceSlug = null,
    string? EventType = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    bool? IsFeatured = null,
    Guid? StoreId = null,
    int Page = 1,
    int PageSize = 12
);

// Public: Calendar view (simplified for calendar grid)
public record EventCalendarDto(
    Guid Id,
    string Title,
    string Slug,
    string EventType,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? StartTime,
    string StoreName,
    string StoreSlug,
    string? ProvinceSlug
);

// Admin: Create event
public record EventCreateDto(
    Guid StoreId,
    string Title,
    string EventType,
    DateOnly StartDate,
    string? Description = null,
    string? ImageUrl = null,
    DateOnly? EndDate = null,
    string? StartTime = null,
    string? EndTime = null,
    decimal? Price = null,
    decimal? PriceMax = null,
    string? TicketUrl = null,
    bool IsRecurring = false,
    string? RecurrencePattern = null,
    bool IsActive = true,
    bool IsFeatured = false
);

// Admin: Update event (all fields nullable for partial update)
public record EventUpdateDto(
    Guid? StoreId = null,
    string? Title = null,
    string? EventType = null,
    DateOnly? StartDate = null,
    string? Description = null,
    string? ImageUrl = null,
    DateOnly? EndDate = null,
    string? StartTime = null,
    string? EndTime = null,
    decimal? Price = null,
    decimal? PriceMax = null,
    string? TicketUrl = null,
    bool? IsRecurring = null,
    string? RecurrencePattern = null,
    bool? IsActive = null,
    bool? IsFeatured = null
);

// Admin: Event list item
public record AdminEventListDto(
    Guid Id,
    string Title,
    string Slug,
    string EventType,
    string StoreName,
    string? ProvinceName,
    DateOnly StartDate,
    DateOnly? EndDate,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt
);

// Admin: Event detail
public record AdminEventDto(
    Guid Id,
    Guid StoreId,
    string StoreName,
    string? ProvinceName,
    string Title,
    string Slug,
    string EventType,
    string? Description,
    string? ImageUrl,
    DateOnly StartDate,
    DateOnly? EndDate,
    string? StartTime,
    string? EndTime,
    decimal? Price,
    decimal? PriceMax,
    string? TicketUrl,
    bool IsRecurring,
    string? RecurrencePattern,
    bool IsActive,
    bool IsFeatured,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
