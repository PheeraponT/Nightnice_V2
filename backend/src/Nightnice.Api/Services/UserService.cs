using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

public class UserService
{
    private readonly UserRepository _userRepository;
    private readonly StoreRepository _storeRepository;

    public UserService(UserRepository userRepository, StoreRepository storeRepository)
    {
        _userRepository = userRepository;
        _storeRepository = storeRepository;
    }

    /// <summary>
    /// Get or create user from Firebase token
    /// </summary>
    public async Task<User> GetOrCreateUserAsync(string firebaseUid, string email, string? displayName, string? photoUrl, string? provider)
    {
        var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

        if (user == null)
        {
            // Create new user
            user = new User
            {
                Id = Guid.NewGuid(),
                FirebaseUid = firebaseUid,
                Email = email,
                DisplayName = displayName,
                PhotoUrl = photoUrl,
                Provider = provider,
                LastLoginAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);
        }
        else
        {
            // Update last login
            await _userRepository.UpdateLastLoginAsync(user.Id);
        }

        return user;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetByFirebaseUidAsync(string firebaseUid)
    {
        return await _userRepository.GetByFirebaseUidAsync(firebaseUid);
    }

    public async Task<bool> IsBannedAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user?.IsBanned ?? false;
    }

    public async Task<UserAccountDto?> GetAccountAsync(string firebaseUid)
    {
        var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
        if (user == null)
        {
            return null;
        }

        var favorites = await _userRepository.GetFavoriteStoreIdsAsync(user.Id);

        return new UserAccountDto(
            user.Id,
            user.FirebaseUid,
            user.Email,
            user.DisplayName,
            user.PhotoUrl,
            user.Provider,
            user.ShareLocation,
            user.AllowMoodDigest,
            user.MarketingUpdates,
            user.CreatedAt,
            user.LastLoginAt,
            favorites
        );
    }

    public async Task UpdatePreferencesAsync(Guid userId, UserPreferencesDto preferences)
    {
        await _userRepository.UpdatePreferencesAsync(userId, preferences.ShareLocation, preferences.AllowMoodDigest, preferences.MarketingUpdates);
    }

    public async Task<UserFavoritesDto> GetFavoritesAsync(Guid userId)
    {
        var storeIds = await _userRepository.GetFavoriteStoreIdsAsync(userId);
        return new UserFavoritesDto(storeIds, storeIds.Count);
    }

    public Task AddFavoriteAsync(Guid userId, Guid storeId) => _userRepository.AddFavoriteAsync(userId, storeId);

    public Task RemoveFavoriteAsync(Guid userId, Guid storeId) => _userRepository.RemoveFavoriteAsync(userId, storeId);

    public Task ClearFavoritesAsync(Guid userId) => _userRepository.ClearFavoritesAsync(userId);

    public async Task<UserDataExportDto> ExportAccountDataAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found");

        var favorites = await _userRepository.GetFavoriteStoreIdsAsync(userId);
        var favoriteStores = favorites.Any()
            ? await _storeRepository.GetByIdsAsync(favorites.ToList())
            : Enumerable.Empty<StoreListDto>();

        var accountDto = new UserAccountDto(
            user.Id,
            user.FirebaseUid,
            user.Email,
            user.DisplayName,
            user.PhotoUrl,
            user.Provider,
            user.ShareLocation,
            user.AllowMoodDigest,
            user.MarketingUpdates,
            user.CreatedAt,
            user.LastLoginAt,
            favorites
        );

        var favoriteSummaries = favoriteStores.Select(store => new UserFavoriteStoreExportDto(
            store.Id,
            store.Name,
            store.Slug
        ));

        return new UserDataExportDto(
            DateTime.UtcNow,
            accountDto,
            favoriteSummaries
        );
    }
}
