using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Data.Repositories;

public class ProvinceRepository
{
    private readonly NightniceDbContext _context;

    public ProvinceRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProvinceDto>> GetAllWithStoreCountAsync()
    {
        return await _context.Provinces
            .Include(p => p.Region)
            .Include(p => p.Stores)
            .OrderBy(p => p.Region!.SortOrder)
            .ThenBy(p => p.SortOrder)
            .Select(p => new ProvinceDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Region!.Name,
                p.Region.Slug,
                p.Stores.Count(s => s.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<IEnumerable<ProvinceListDto>> GetAllAsync()
    {
        return await _context.Provinces
            .OrderBy(p => p.Region!.SortOrder)
            .ThenBy(p => p.SortOrder)
            .Select(p => new ProvinceListDto(p.Id, p.Name, p.Slug))
            .ToListAsync();
    }

    public async Task<IEnumerable<RegionWithProvincesDto>> GetGroupedByRegionAsync()
    {
        var regions = await _context.Regions
            .Include(r => r.Provinces)
            .OrderBy(r => r.SortOrder)
            .ToListAsync();

        return regions.Select(r => new RegionWithProvincesDto(
            r.Id,
            r.Name,
            r.Slug,
            r.Provinces
                .OrderBy(p => p.SortOrder)
                .Select(p => new ProvinceListDto(p.Id, p.Name, p.Slug))
        ));
    }

    public async Task<ProvinceDto?> GetBySlugAsync(string slug)
    {
        return await _context.Provinces
            .Include(p => p.Region)
            .Include(p => p.Stores)
            .Where(p => p.Slug == slug)
            .Select(p => new ProvinceDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Region!.Name,
                p.Region.Slug,
                p.Stores.Count(s => s.IsActive)
            ))
            .FirstOrDefaultAsync();
    }

    // T071: Province detail with category counts
    public async Task<ProvinceDetailDto?> GetDetailBySlugAsync(string slug)
    {
        var province = await _context.Provinces
            .Include(p => p.Region)
            .Where(p => p.Slug == slug)
            .FirstOrDefaultAsync();

        if (province == null)
            return null;

        // Get category counts for stores in this province
        // First get the raw data, then filter and map to DTO in memory
        var categoryData = await _context.Categories
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                StoreCount = c.StoreCategories.Count(sc =>
                    sc.Store.ProvinceId == province.Id &&
                    sc.Store.IsActive)
            })
            .ToListAsync();

        var categoryCounts = categoryData
            .Where(c => c.StoreCount > 0)
            .OrderByDescending(c => c.StoreCount)
            .Select(c => new CategoryCountDto(c.Id, c.Name, c.Slug, c.StoreCount))
            .ToList();

        var totalStoreCount = await _context.Stores
            .CountAsync(s => s.ProvinceId == province.Id && s.IsActive);

        return new ProvinceDetailDto(
            province.Id,
            province.Name,
            province.Slug,
            province.SeoDescription,
            province.Region!.Name,
            province.Region.Slug,
            totalStoreCount,
            categoryCounts
        );
    }

    // T073: Get all regions with counts
    public async Task<IEnumerable<RegionDto>> GetAllRegionsAsync()
    {
        return await _context.Regions
            .OrderBy(r => r.SortOrder)
            .Select(r => new RegionDto(
                r.Id,
                r.Name,
                r.Slug,
                r.Provinces.Count,
                r.Provinces.SelectMany(p => p.Stores).Count(s => s.IsActive)
            ))
            .ToListAsync();
    }

    // T130: Admin province methods
    public async Task<IEnumerable<AdminProvinceDto>> GetAdminProvincesAsync()
    {
        return await _context.Provinces
            .Include(p => p.Region)
            .Include(p => p.Stores)
            .OrderBy(p => p.Region!.SortOrder)
            .ThenBy(p => p.SortOrder)
            .Select(p => new AdminProvinceDto(
                p.Id,
                p.Name,
                p.Slug,
                p.SeoDescription,
                p.SortOrder,
                p.RegionId,
                p.Region!.Name,
                p.Stores.Count(s => s.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<AdminProvinceDto?> GetAdminProvinceByIdAsync(Guid id)
    {
        return await _context.Provinces
            .Include(p => p.Region)
            .Include(p => p.Stores)
            .Where(p => p.Id == id)
            .Select(p => new AdminProvinceDto(
                p.Id,
                p.Name,
                p.Slug,
                p.SeoDescription,
                p.SortOrder,
                p.RegionId,
                p.Region!.Name,
                p.Stores.Count(s => s.IsActive)
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<AdminProvinceDto?> UpdateAsync(Guid id, ProvinceUpdateDto updateDto)
    {
        var province = await _context.Provinces.FindAsync(id);
        if (province == null)
            return null;

        if (updateDto.SeoDescription != null)
            province.SeoDescription = updateDto.SeoDescription;
        if (updateDto.SortOrder.HasValue)
            province.SortOrder = updateDto.SortOrder.Value;

        province.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetAdminProvinceByIdAsync(id);
    }
}
