namespace Nightnice.Api.DTOs;

public record UserPreferencesDto(
    bool ShareLocation,
    bool AllowMoodDigest,
    bool MarketingUpdates
);

public record UserAccountDto(
    Guid UserId,
    string FirebaseUid,
    string Email,
    string? DisplayName,
    string? PhotoUrl,
    string? Provider,
    bool ShareLocation,
    bool AllowMoodDigest,
    bool MarketingUpdates,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    IReadOnlyList<Guid> FavoriteStoreIds
);

public record UserFavoritesDto(
    IReadOnlyList<Guid> StoreIds,
    int TotalCount
);

public record UserDataExportDto(
    DateTime ExportedAt,
    UserAccountDto Account,
    IEnumerable<UserFavoriteStoreExportDto> Favorites
);

public record UserFavoriteStoreExportDto(
    Guid StoreId,
    string Name,
    string Slug
);

public record UserFavoriteRequestDto(Guid StoreId);
