namespace Nightnice.Api.DTOs;

public record CommunityPostDto(
    Guid Id,
    string Title,
    string? Summary,
    string? Story,
    string MoodId,
    short? MoodMatch,
    IEnumerable<string> VibeTags,
    CommunityPostStoreDto Store,
    CommunityPostAuthorDto Author,
    IEnumerable<CommunityPostImageDto> Images,
    DateTime CreatedAt
);

public record CommunityPostStoreDto(
    Guid StoreId,
    string StoreName,
    string StoreSlug,
    string? ProvinceName
);

public record CommunityPostAuthorDto(
    Guid UserId,
    string? DisplayName,
    string? PhotoUrl
);

public record CommunityPostImageDto(
    Guid Id,
    string Url,
    string? AltText,
    int SortOrder
);

public record CommunityPostCreateDto(
    Guid StoreId,
    string Title,
    string? Summary,
    string? Story,
    string MoodId,
    short? MoodMatch,
    IEnumerable<string> VibeTags,
    IEnumerable<CommunityPostImageInputDto> Images
);

public record CommunityPostImageInputDto(
    string Url,
    string? AltText
);

public record CommunityPostUpdateDto(
    string Title,
    string? Summary,
    string? Story,
    string MoodId,
    short? MoodMatch,
    IEnumerable<string> VibeTags,
    IEnumerable<CommunityPostImageInputDto> Images
);

public record CommunityPostFeedParams(
    string? MoodId = null,
    Guid? StoreId = null,
    int Page = 1,
    int PageSize = 10
);
