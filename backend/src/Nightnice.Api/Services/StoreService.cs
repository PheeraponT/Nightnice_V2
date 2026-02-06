using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;
using Nightnice.Api.Endpoints;

namespace Nightnice.Api.Services;

public class StoreService
{
    private readonly StoreRepository _storeRepository;

    public StoreService(StoreRepository storeRepository)
    {
        _storeRepository = storeRepository;
    }

    // T116: Admin store management methods
    public async Task<PaginatedResult<AdminStoreListDto>> GetAdminStoresAsync(AdminStoreSearchParams searchParams)
    {
        var validatedParams = searchParams with
        {
            Page = Math.Max(1, searchParams.Page),
            PageSize = Math.Clamp(searchParams.PageSize, 1, 100)
        };

        return await _storeRepository.GetAdminStoresAsync(validatedParams);
    }

    public async Task<AdminStoreDto?> GetAdminStoreByIdAsync(Guid id)
    {
        return await _storeRepository.GetAdminStoreByIdAsync(id);
    }

    public async Task<AdminStoreDto> CreateStoreAsync(StoreCreateDto createDto)
    {
        return await _storeRepository.CreateAsync(createDto);
    }

    public async Task<AdminStoreDto?> UpdateStoreAsync(Guid id, StoreUpdateDto updateDto)
    {
        return await _storeRepository.UpdateAsync(id, updateDto);
    }

    public async Task<bool> DeleteStoreAsync(Guid id)
    {
        return await _storeRepository.DeleteAsync(id);
    }

    // T117: Store image management
    public async Task<StoreImageDto?> AddStoreImageAsync(Guid storeId, string imageUrl)
    {
        return await _storeRepository.AddImageAsync(storeId, imageUrl);
    }

    public async Task<StoreImageDto?> GetStoreImageAsync(Guid storeId, Guid imageId)
    {
        return await _storeRepository.GetImageAsync(storeId, imageId);
    }

    public async Task<bool> DeleteStoreImageAsync(Guid storeId, Guid imageId)
    {
        return await _storeRepository.DeleteImageAsync(storeId, imageId);
    }

    public async Task<PaginatedResult<StoreListDto>> SearchStoresAsync(StoreSearchParams searchParams)
    {
        // Validate page size
        var validatedParams = searchParams with
        {
            Page = Math.Max(1, searchParams.Page),
            PageSize = Math.Clamp(searchParams.PageSize, 1, 50)
        };

        return await _storeRepository.SearchAsync(validatedParams);
    }

    public async Task<StoreDetailDto?> GetStoreBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        return await _storeRepository.GetBySlugAsync(slug.Trim().ToLower());
    }

    public async Task<IEnumerable<StoreListDto>> GetFeaturedStoresAsync(int count = 6)
    {
        return await _storeRepository.GetFeaturedAsync(Math.Clamp(count, 1, 20));
    }

    public async Task<IEnumerable<StoreListDto>> GetStoresByIdsAsync(List<Guid> ids)
    {
        return await _storeRepository.GetByIdsAsync(ids);
    }

    // Get stores for map display
    public async Task<IEnumerable<StoreMapDto>> GetMapStoresAsync(
        string? provinceSlug = null,
        string? categorySlug = null,
        int maxCount = 1000,
        decimal? userLat = null,
        decimal? userLng = null,
        bool sortByDistance = false)
    {
        return await _storeRepository.GetMapStoresAsync(
            provinceSlug,
            categorySlug,
            Math.Clamp(maxCount, 1, 2000),
            userLat,
            userLng,
            sortByDistance);
    }

    // T082: Get nearby stores
    public async Task<IEnumerable<NearbyStoreDto>> GetNearbyStoresAsync(string slug, double radiusKm = 5.0, int maxCount = 6)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return Enumerable.Empty<NearbyStoreDto>();

        // Clamp radius between 1 and 50 km, count between 1 and 20
        var clampedRadius = Math.Clamp(radiusKm, 1.0, 50.0);
        var clampedCount = Math.Clamp(maxCount, 1, 20);

        return await _storeRepository.GetNearbyAsync(slug.Trim().ToLower(), clampedRadius, clampedCount);
    }

    public async Task<StoreMoodInsightDto?> GetMoodInsightAsync(Guid storeId)
    {
        return await _storeRepository.GetMoodInsightAsync(storeId);
    }
}
