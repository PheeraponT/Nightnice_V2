using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;
using Nightnice.Api.Endpoints;
using Nightnice.Api.Models;
using Nightnice.Api.Services;

namespace Nightnice.Api.Data.Repositories;

public class StoreRepository
{
    private readonly NightniceDbContext _context;

    public StoreRepository(NightniceDbContext context)
    {
        _context = context;
    }

    // T116: Admin store list with filtering
    public async Task<PaginatedResult<AdminStoreListDto>> GetAdminStoresAsync(AdminStoreSearchParams searchParams)
    {
        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Include(s => s.Images)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchParams.Query))
        {
            var searchTerm = searchParams.Query.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(searchTerm) ||
                s.Slug.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(searchParams.ProvinceId) && Guid.TryParse(searchParams.ProvinceId, out var provinceId))
        {
            query = query.Where(s => s.ProvinceId == provinceId);
        }

        if (!string.IsNullOrWhiteSpace(searchParams.CategoryId) && Guid.TryParse(searchParams.CategoryId, out var categoryId))
        {
            query = query.Where(s => s.StoreCategories.Any(sc => sc.CategoryId == categoryId));
        }

        if (searchParams.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == searchParams.IsActive.Value);
        }

        if (searchParams.IsFeatured.HasValue)
        {
            query = query.Where(s => s.IsFeatured == searchParams.IsFeatured.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(s => new AdminStoreListDto(
                s.Id,
                s.Name,
                s.Slug,
                s.Province != null ? s.Province.Name : "",
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.IsActive,
                s.IsFeatured,
                s.Images.Count,
                s.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / searchParams.PageSize);

        return new PaginatedResult<AdminStoreListDto>(
            items,
            totalCount,
            searchParams.Page,
            searchParams.PageSize,
            totalPages
        );
    }

    // T116: Get single store for admin (includes all fields)
    public async Task<AdminStoreDto?> GetAdminStoreByIdAsync(Guid id)
    {
        var store = await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Include(s => s.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(s => s.Id == id);

        if (store == null)
            return null;

        return MapToAdminStoreDto(store);
    }

    // T116: Create store
    public async Task<AdminStoreDto> CreateAsync(StoreCreateDto createDto)
    {
        var slug = GenerateSlug(createDto.Name);

        // Ensure unique slug
        var baseSlug = slug;
        var counter = 1;
        while (await _context.Stores.AnyAsync(s => s.Slug == slug))
        {
            slug = $"{baseSlug}-{counter++}";
        }

        var store = new Store
        {
            Id = Guid.NewGuid(),
            Name = createDto.Name,
            Slug = slug,
            ProvinceId = createDto.ProvinceId,
            Description = createDto.Description,
            LogoUrl = createDto.LogoUrl,
            BannerUrl = createDto.BannerUrl,
            Phone = createDto.Phone,
            Address = createDto.Address,
            Latitude = createDto.Latitude,
            Longitude = createDto.Longitude,
            GoogleMapUrl = createDto.GoogleMapUrl,
            LineId = createDto.LineId,
            FacebookUrl = createDto.FacebookUrl,
            InstagramUrl = createDto.InstagramUrl,
            PriceRange = createDto.PriceRange,
            OpenTime = ParseTime(createDto.OpenTime),
            CloseTime = ParseTime(createDto.CloseTime),
            Facilities = createDto.Facilities?.ToList() ?? [],
            IsActive = createDto.IsActive,
            IsFeatured = createDto.IsFeatured,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Stores.Add(store);

        // Add categories
        foreach (var categoryId in createDto.CategoryIds)
        {
            _context.StoreCategories.Add(new StoreCategory
            {
                StoreId = store.Id,
                CategoryId = categoryId
            });
        }

        await _context.SaveChangesAsync();

        // Reload with relations
        return (await GetAdminStoreByIdAsync(store.Id))!;
    }

    // T116: Update store
    public async Task<AdminStoreDto?> UpdateAsync(Guid id, StoreUpdateDto updateDto)
    {
        var store = await _context.Stores
            .Include(s => s.StoreCategories)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (store == null)
            return null;

        // Update fields if provided
        if (updateDto.Name != null)
        {
            store.Name = updateDto.Name;
            store.Slug = GenerateSlug(updateDto.Name);
        }
        if (updateDto.ProvinceId.HasValue) store.ProvinceId = updateDto.ProvinceId.Value;
        if (updateDto.Description != null) store.Description = updateDto.Description;
        if (updateDto.LogoUrl != null) store.LogoUrl = updateDto.LogoUrl;
        if (updateDto.BannerUrl != null) store.BannerUrl = updateDto.BannerUrl;
        if (updateDto.Phone != null) store.Phone = updateDto.Phone;
        if (updateDto.Address != null) store.Address = updateDto.Address;
        if (updateDto.Latitude.HasValue) store.Latitude = updateDto.Latitude;
        if (updateDto.Longitude.HasValue) store.Longitude = updateDto.Longitude;
        if (updateDto.GoogleMapUrl != null) store.GoogleMapUrl = updateDto.GoogleMapUrl;
        if (updateDto.LineId != null) store.LineId = updateDto.LineId;
        if (updateDto.FacebookUrl != null) store.FacebookUrl = updateDto.FacebookUrl;
        if (updateDto.InstagramUrl != null) store.InstagramUrl = updateDto.InstagramUrl;
        if (updateDto.PriceRange.HasValue) store.PriceRange = updateDto.PriceRange;
        if (updateDto.OpenTime != null) store.OpenTime = ParseTime(updateDto.OpenTime);
        if (updateDto.CloseTime != null) store.CloseTime = ParseTime(updateDto.CloseTime);
        if (updateDto.Facilities != null) store.Facilities = updateDto.Facilities.ToList();
        if (updateDto.IsActive.HasValue) store.IsActive = updateDto.IsActive.Value;
        if (updateDto.IsFeatured.HasValue) store.IsFeatured = updateDto.IsFeatured.Value;

        store.UpdatedAt = DateTime.UtcNow;

        // Update categories if provided
        if (updateDto.CategoryIds != null)
        {
            _context.StoreCategories.RemoveRange(store.StoreCategories);
            foreach (var categoryId in updateDto.CategoryIds)
            {
                _context.StoreCategories.Add(new StoreCategory
                {
                    StoreId = store.Id,
                    CategoryId = categoryId
                });
            }
        }

        await _context.SaveChangesAsync();

        return await GetAdminStoreByIdAsync(id);
    }

    // T116: Delete store (soft delete by setting IsActive = false, or hard delete)
    public async Task<bool> DeleteAsync(Guid id)
    {
        var store = await _context.Stores.FindAsync(id);
        if (store == null)
            return false;

        _context.Stores.Remove(store);
        await _context.SaveChangesAsync();
        return true;
    }

    // T117: Add image to store
    public async Task<StoreImageDto?> AddImageAsync(Guid storeId, string imageUrl)
    {
        var store = await _context.Stores.Include(s => s.Images).FirstOrDefaultAsync(s => s.Id == storeId);
        if (store == null)
            return null;

        var sortOrder = store.Images.Any() ? store.Images.Max(i => i.SortOrder) + 1 : 0;

        var image = new StoreImage
        {
            Id = Guid.NewGuid(),
            StoreId = storeId,
            Url = imageUrl,
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow
        };

        _context.StoreImages.Add(image);
        await _context.SaveChangesAsync();

        return new StoreImageDto(image.Id, image.Url, null, image.SortOrder);
    }

    // T117: Get store image
    public async Task<StoreImageDto?> GetImageAsync(Guid storeId, Guid imageId)
    {
        var image = await _context.StoreImages
            .FirstOrDefaultAsync(i => i.StoreId == storeId && i.Id == imageId);

        if (image == null)
            return null;

        return new StoreImageDto(image.Id, image.Url, null, image.SortOrder);
    }

    // T117: Delete store image
    public async Task<bool> DeleteImageAsync(Guid storeId, Guid imageId)
    {
        var image = await _context.StoreImages
            .FirstOrDefaultAsync(i => i.StoreId == storeId && i.Id == imageId);

        if (image == null)
            return false;

        _context.StoreImages.Remove(image);
        await _context.SaveChangesAsync();
        return true;
    }

    private AdminStoreDto MapToAdminStoreDto(Store store)
    {
        return new AdminStoreDto(
            store.Id,
            store.Name,
            store.Slug,
            store.ProvinceId,
            store.Province?.Name ?? "",
            store.StoreCategories.Select(sc => new CategoryInfoDto(sc.Category.Id, sc.Category.Name, sc.Category.Slug)),
            store.Description,
            store.LogoUrl,
            store.BannerUrl,
            store.Phone,
            store.Address,
            store.Latitude,
            store.Longitude,
            store.GoogleMapUrl,
            store.LineId,
            store.FacebookUrl,
            store.InstagramUrl,
            store.PriceRange,
            store.OpenTime?.ToString("HH:mm"),
            store.CloseTime?.ToString("HH:mm"),
            store.Facilities,
            store.Images.Select(i => new StoreImageDto(i.Id, i.Url, null, i.SortOrder)),
            store.IsActive,
            store.IsFeatured,
            store.CreatedAt,
            store.UpdatedAt
        );
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }

    private static TimeOnly? ParseTime(string? timeStr)
    {
        if (string.IsNullOrEmpty(timeStr))
            return null;

        if (TimeOnly.TryParse(timeStr, out var time))
            return time;

        return null;
    }

    public async Task<PaginatedResult<StoreListDto>> SearchAsync(StoreSearchParams searchParams)
    {
        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchParams.Query))
        {
            var searchTerm = searchParams.Query.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(searchTerm) ||
                (s.Description != null && s.Description.ToLower().Contains(searchTerm)) ||
                (s.Address != null && s.Address.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(searchParams.ProvinceSlug))
        {
            query = query.Where(s => s.Province != null && s.Province.Slug == searchParams.ProvinceSlug);
        }

        if (!string.IsNullOrWhiteSpace(searchParams.CategorySlug))
        {
            query = query.Where(s => s.StoreCategories.Any(sc => sc.Category.Slug == searchParams.CategorySlug));
        }

        if (searchParams.MinPrice.HasValue)
        {
            query = query.Where(s => s.PriceRange >= searchParams.MinPrice.Value);
        }

        if (searchParams.MaxPrice.HasValue)
        {
            query = query.Where(s => s.PriceRange <= searchParams.MaxPrice.Value);
        }

        if (searchParams.IsFeatured.HasValue)
        {
            query = query.Where(s => s.IsFeatured == searchParams.IsFeatured.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // If sorting by distance and user location provided
        if (searchParams.SortByDistance && searchParams.UserLatitude.HasValue && searchParams.UserLongitude.HasValue)
        {
            var userLat = (double)searchParams.UserLatitude.Value;
            var userLon = (double)searchParams.UserLongitude.Value;

            // Get all matching stores and calculate distances in memory
            var allStores = await query.ToListAsync();

            var storesWithDistance = allStores
                .Select(s =>
                {
                    double? distance = null;
                    if (s.Latitude.HasValue && s.Longitude.HasValue)
                    {
                        distance = GeoService.CalculateDistanceKm(
                            userLat, userLon,
                            (double)s.Latitude.Value, (double)s.Longitude.Value);
                    }
                    return new { Store = s, Distance = distance };
                })
                .OrderBy(x => x.Distance ?? double.MaxValue) // Stores without coordinates go last
                .ThenByDescending(x => x.Store.IsFeatured)
                .Skip((searchParams.Page - 1) * searchParams.PageSize)
                .Take(searchParams.PageSize)
                .Select(x => new StoreListDto(
                    x.Store.Id,
                    x.Store.Name,
                    x.Store.Slug,
                    x.Store.Description,
                    x.Store.LogoUrl,
                    x.Store.BannerUrl,
                    x.Store.Province?.Name,
                    x.Store.Province?.Slug,
                    x.Store.StoreCategories.Select(sc => sc.Category.Name),
                    x.Store.PriceRange,
                    x.Store.OpenTime?.ToString("HH:mm"),
                    x.Store.CloseTime?.ToString("HH:mm"),
                    x.Store.IsFeatured,
                    x.Distance.HasValue ? Math.Round(x.Distance.Value, 2) : null
                ))
                .ToList();

            var totalPages = (int)Math.Ceiling((double)totalCount / searchParams.PageSize);

            return new PaginatedResult<StoreListDto>(
                storesWithDistance,
                totalCount,
                searchParams.Page,
                searchParams.PageSize,
                totalPages
            );
        }

        // Default ordering (no distance sorting)
        var items = await query
            .OrderByDescending(s => s.IsFeatured)
            .ThenByDescending(s => s.CreatedAt)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .ToListAsync();

        // Calculate distance if user location provided (but not sorting by distance)
        double? userLatD = searchParams.UserLatitude.HasValue ? (double)searchParams.UserLatitude.Value : null;
        double? userLonD = searchParams.UserLongitude.HasValue ? (double)searchParams.UserLongitude.Value : null;

        var result = items.Select(s =>
        {
            double? distance = null;
            if (userLatD.HasValue && userLonD.HasValue && s.Latitude.HasValue && s.Longitude.HasValue)
            {
                distance = Math.Round(GeoService.CalculateDistanceKm(
                    userLatD.Value, userLonD.Value,
                    (double)s.Latitude.Value, (double)s.Longitude.Value), 2);
            }
            return new StoreListDto(
                s.Id,
                s.Name,
                s.Slug,
                s.Description,
                s.LogoUrl,
                s.BannerUrl,
                s.Province?.Name,
                s.Province?.Slug,
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.PriceRange,
                s.OpenTime?.ToString("HH:mm"),
                s.CloseTime?.ToString("HH:mm"),
                s.IsFeatured,
                distance
            );
        }).ToList();

        var totalPagesResult = (int)Math.Ceiling((double)totalCount / searchParams.PageSize);

        return new PaginatedResult<StoreListDto>(
            result,
            totalCount,
            searchParams.Page,
            searchParams.PageSize,
            totalPagesResult
        );
    }

    public async Task<StoreDetailDto?> GetBySlugAsync(string slug)
    {
        var store = await _context.Stores
            .Include(s => s.Province)
                .ThenInclude(p => p!.Region)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Include(s => s.Images.OrderBy(i => i.SortOrder))
            .Where(s => s.Slug == slug && s.IsActive)
            .FirstOrDefaultAsync();

        if (store == null)
            return null;

        return new StoreDetailDto(
            store.Id,
            store.Name,
            store.Slug,
            store.Description,
            store.LogoUrl,
            store.BannerUrl,
            store.Images.Select(i => new StoreImageDto(i.Id, i.Url, null, i.SortOrder)),
            store.Province?.Name,
            store.Province?.Slug,
            store.Province?.Region?.Name,
            store.Province?.Region?.Slug,
            store.StoreCategories.Select(sc => new CategoryInfoDto(sc.Category.Id, sc.Category.Name, sc.Category.Slug)),
            store.Address,
            store.GoogleMapUrl,
            store.Latitude,
            store.Longitude,
            store.Phone,
            store.LineId,
            store.FacebookUrl,
            store.InstagramUrl,
            store.PriceRange,
            store.OpenTime?.ToString("HH:mm"),
            store.CloseTime?.ToString("HH:mm"),
            store.Facilities,
            store.IsFeatured,
            store.CreatedAt
        );
    }

    public async Task<IEnumerable<StoreListDto>> GetFeaturedAsync(int count = 6)
    {
        return await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive && s.IsFeatured)
            .OrderByDescending(s => s.CreatedAt)
            .Take(count)
            .Select(s => new StoreListDto(
                s.Id,
                s.Name,
                s.Slug,
                s.Description,
                s.LogoUrl,
                s.BannerUrl,
                s.Province != null ? s.Province.Name : null,
                s.Province != null ? s.Province.Slug : null,
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.PriceRange,
                s.OpenTime != null ? s.OpenTime.Value.ToString("HH:mm") : null,
                s.CloseTime != null ? s.CloseTime.Value.ToString("HH:mm") : null,
                s.IsFeatured,
                null // DistanceKm not calculated for featured stores
            ))
            .ToListAsync();
    }

    // Get stores by IDs (for favorites)
    public async Task<IEnumerable<StoreListDto>> GetByIdsAsync(List<Guid> ids)
    {
        if (ids == null || ids.Count == 0)
            return Enumerable.Empty<StoreListDto>();

        return await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive && ids.Contains(s.Id))
            .Select(s => new StoreListDto(
                s.Id,
                s.Name,
                s.Slug,
                s.Description,
                s.LogoUrl,
                s.BannerUrl,
                s.Province != null ? s.Province.Name : null,
                s.Province != null ? s.Province.Slug : null,
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.PriceRange,
                s.OpenTime != null ? s.OpenTime.Value.ToString("HH:mm") : null,
                s.CloseTime != null ? s.CloseTime.Value.ToString("HH:mm") : null,
                s.IsFeatured,
                null // DistanceKm not calculated
            ))
            .ToListAsync();
    }

    // Get stores for map display (only stores with coordinates)
    public async Task<IEnumerable<StoreMapDto>> GetMapStoresAsync(
        string? provinceSlug = null,
        string? categorySlug = null,
        int maxCount = 1000,
        decimal? userLat = null,
        decimal? userLon = null,
        bool sortByDistance = false)
    {
        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive && s.Latitude != null && s.Longitude != null)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(provinceSlug))
        {
            query = query.Where(s => s.Province != null && s.Province.Slug == provinceSlug);
        }

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(s => s.StoreCategories.Any(sc => sc.Category.Slug == categorySlug));
        }

        var stores = await query.Take(maxCount).ToListAsync();

        // Calculate distances if user location provided
        if (userLat.HasValue && userLon.HasValue)
        {
            var userLatD = (double)userLat.Value;
            var userLonD = (double)userLon.Value;

            var storesWithDistance = stores.Select(s =>
            {
                var distance = GeoService.CalculateDistanceKm(
                    userLatD, userLonD,
                    (double)s.Latitude!.Value, (double)s.Longitude!.Value);

                return new StoreMapDto(
                    s.Id,
                    s.Name,
                    s.Slug,
                    s.LogoUrl,
                    s.BannerUrl,
                    s.Province?.Name,
                    s.StoreCategories.Select(sc => sc.Category.Name),
                    s.PriceRange,
                    s.Latitude!.Value,
                    s.Longitude!.Value,
                    Math.Round(distance, 2),
                    s.OpenTime?.ToString("HH:mm"),
                    s.CloseTime?.ToString("HH:mm")
                );
            });

            if (sortByDistance)
            {
                return storesWithDistance.OrderBy(s => s.DistanceKm).ToList();
            }

            return storesWithDistance.ToList();
        }

        // No user location - return without distance
        return stores.Select(s => new StoreMapDto(
            s.Id,
            s.Name,
            s.Slug,
            s.LogoUrl,
            s.BannerUrl,
            s.Province?.Name,
            s.StoreCategories.Select(sc => sc.Category.Name),
            s.PriceRange,
            s.Latitude!.Value,
            s.Longitude!.Value,
            null,
            s.OpenTime?.ToString("HH:mm"),
            s.CloseTime?.ToString("HH:mm")
        )).ToList();
    }

    // T082: Get nearby stores within radius using Haversine formula
    public async Task<IEnumerable<NearbyStoreDto>> GetNearbyAsync(string slug, double radiusKm = 5.0, int maxCount = 6)
    {
        // First get the current store's coordinates
        var currentStore = await _context.Stores
            .Where(s => s.Slug == slug && s.IsActive)
            .Select(s => new { s.Id, s.Latitude, s.Longitude })
            .FirstOrDefaultAsync();

        if (currentStore == null || currentStore.Latitude == null || currentStore.Longitude == null)
            return Enumerable.Empty<NearbyStoreDto>();

        var lat = (double)currentStore.Latitude;
        var lon = (double)currentStore.Longitude;

        // Get all active stores with coordinates (excluding current store)
        var storesWithCoords = await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive &&
                        s.Id != currentStore.Id &&
                        s.Latitude != null &&
                        s.Longitude != null)
            .ToListAsync();

        // Calculate distances in memory (Haversine can't be translated to SQL)
        var nearbyStores = storesWithCoords
            .Select(s => new
            {
                Store = s,
                Distance = GeoService.CalculateDistanceKm(
                    lat, lon,
                    (double)s.Latitude!.Value, (double)s.Longitude!.Value)
            })
            .Where(x => x.Distance <= radiusKm)
            .OrderBy(x => x.Distance)
            .Take(maxCount)
            .Select(x => new NearbyStoreDto(
                x.Store.Id,
                x.Store.Name,
                x.Store.Slug,
                x.Store.LogoUrl,
                x.Store.Province?.Name,
                x.Store.StoreCategories.Select(sc => sc.Category.Name),
                x.Store.PriceRange,
                Math.Round(x.Distance, 2)
            ))
            .ToList();

        return nearbyStores;
    }
}
