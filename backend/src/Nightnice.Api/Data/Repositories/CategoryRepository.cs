using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Data.Repositories;

public class CategoryRepository
{
    private readonly NightniceDbContext _context;

    public CategoryRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllWithStoreCountAsync()
    {
        return await _context.Categories
            .Include(c => c.StoreCategories)
                .ThenInclude(sc => sc.Store)
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.StoreCategories.Count(sc => sc.Store.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<IEnumerable<CategoryListDto>> GetAllAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryListDto(c.Id, c.Name, c.Slug))
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetBySlugAsync(string slug)
    {
        return await _context.Categories
            .Include(c => c.StoreCategories)
                .ThenInclude(sc => sc.Store)
            .Where(c => c.Slug == slug)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.StoreCategories.Count(sc => sc.Store.IsActive)
            ))
            .FirstOrDefaultAsync();
    }

    // T072: Category detail with province counts
    public async Task<CategoryDetailDto?> GetDetailBySlugAsync(string slug)
    {
        var category = await _context.Categories
            .Where(c => c.Slug == slug)
            .FirstOrDefaultAsync();

        if (category == null)
            return null;

        // Get province counts for stores in this category
        var provinceCounts = await _context.Provinces
            .Include(p => p.Stores)
                .ThenInclude(s => s.StoreCategories)
            .Select(p => new ProvinceCountDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Stores.Count(s =>
                    s.IsActive &&
                    s.StoreCategories.Any(sc => sc.CategoryId == category.Id))
            ))
            .Where(pc => pc.StoreCount > 0)
            .OrderByDescending(pc => pc.StoreCount)
            .ToListAsync();

        var totalStoreCount = await _context.StoreCategories
            .CountAsync(sc => sc.CategoryId == category.Id && sc.Store.IsActive);

        return new CategoryDetailDto(
            category.Id,
            category.Name,
            category.Slug,
            totalStoreCount,
            provinceCounts
        );
    }

    // T131: Admin category methods
    public async Task<IEnumerable<AdminCategoryDto>> GetAdminCategoriesAsync()
    {
        return await _context.Categories
            .Include(c => c.StoreCategories)
                .ThenInclude(sc => sc.Store)
            .OrderBy(c => c.SortOrder)
            .Select(c => new AdminCategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                null, // IconEmoji not in model yet
                c.SortOrder,
                c.StoreCategories.Count(sc => sc.Store.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<AdminCategoryDto?> GetAdminCategoryByIdAsync(Guid id)
    {
        return await _context.Categories
            .Include(c => c.StoreCategories)
                .ThenInclude(sc => sc.Store)
            .Where(c => c.Id == id)
            .Select(c => new AdminCategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                null,
                c.SortOrder,
                c.StoreCategories.Count(sc => sc.Store.IsActive)
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<AdminCategoryDto> CreateAsync(CategoryCreateDto createDto)
    {
        var slug = GenerateSlug(createDto.Name);
        var maxSortOrder = await _context.Categories.MaxAsync(c => (int?)c.SortOrder) ?? 0;

        var category = new Models.Category
        {
            Id = Guid.NewGuid(),
            Name = createDto.Name,
            Slug = slug,
            SortOrder = createDto.SortOrder ?? maxSortOrder + 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new AdminCategoryDto(
            category.Id,
            category.Name,
            category.Slug,
            null,
            category.SortOrder,
            0
        );
    }

    public async Task<AdminCategoryDto?> UpdateAsync(Guid id, CategoryUpdateDto updateDto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return null;

        if (updateDto.Name != null)
        {
            category.Name = updateDto.Name;
            category.Slug = GenerateSlug(updateDto.Name);
        }
        if (updateDto.SortOrder.HasValue)
            category.SortOrder = updateDto.SortOrder.Value;

        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetAdminCategoryByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await _context.Categories
            .Include(c => c.StoreCategories)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return false;

        // Don't delete if category has stores
        if (category.StoreCategories.Any())
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    private static string GenerateSlug(string name)
    {
        return name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("ร้าน", "")
            .Trim('-');
    }
}
