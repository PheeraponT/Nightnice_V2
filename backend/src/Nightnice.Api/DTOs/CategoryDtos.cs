namespace Nightnice.Api.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    int StoreCount
);

public record CategoryListDto(
    Guid Id,
    string Name,
    string Slug
);

// T070: Category detail with province counts for SEO landing pages
public record ProvinceCountDto(
    Guid Id,
    string Name,
    string Slug,
    int StoreCount
);

public record CategoryDetailDto(
    Guid Id,
    string Name,
    string Slug,
    int TotalStoreCount,
    IEnumerable<ProvinceCountDto> ProvinceCounts
);

// T129: Admin category DTOs
public record CategoryCreateDto(
    string Name,
    string? IconEmoji = null,
    int? SortOrder = null
);

public record CategoryUpdateDto(
    string? Name = null,
    string? IconEmoji = null,
    int? SortOrder = null
);

public record AdminCategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? IconEmoji,
    int SortOrder,
    int StoreCount
);
