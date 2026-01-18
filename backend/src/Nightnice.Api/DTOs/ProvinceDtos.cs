namespace Nightnice.Api.DTOs;

public record ProvinceDto(
    Guid Id,
    string Name,
    string Slug,
    string RegionName,
    string RegionSlug,
    int StoreCount
);

public record ProvinceListDto(
    Guid Id,
    string Name,
    string Slug
);

public record RegionWithProvincesDto(
    Guid Id,
    string Name,
    string Slug,
    IEnumerable<ProvinceListDto> Provinces
);

// T069: Province detail with category counts for SEO landing pages
public record CategoryCountDto(
    Guid Id,
    string Name,
    string Slug,
    int StoreCount
);

public record ProvinceDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string? SeoDescription,
    string RegionName,
    string RegionSlug,
    int TotalStoreCount,
    IEnumerable<CategoryCountDto> CategoryCounts
);

// T073: Region list
public record RegionDto(
    Guid Id,
    string Name,
    string Slug,
    int ProvinceCount,
    int StoreCount
);

// T128: Admin province update DTO
public record ProvinceUpdateDto(
    string? SeoDescription = null,
    int? SortOrder = null
);

// T128: Admin province list DTO (includes all fields for admin)
public record AdminProvinceDto(
    Guid Id,
    string Name,
    string Slug,
    string? SeoDescription,
    int SortOrder,
    Guid RegionId,
    string RegionName,
    int StoreCount
);
