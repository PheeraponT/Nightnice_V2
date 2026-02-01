using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Data;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

/// <summary>
/// Service for SEO pages: view tracking, popular stores, late-night stores, and themed collections
/// </summary>
public class SeoService
{
    private readonly NightniceDbContext _context;
    private readonly ILogger<SeoService> _logger;

    // Theme definitions mapping slug to facility/category filters
    private static readonly Dictionary<string, ThemeConfig> ThemeDefinitions = new()
    {
        ["live-music"] = new ThemeConfig(
            "ร้านเปิดดนตรีสด",
            "Live Music Venues",
            "รวมร้านกลางคืนที่มีดนตรีสด วงดนตรี แจ๊ส บลูส์ และเพลงสดทั่วไทย",
            "🎵",
            ["live_music"],
            []
        ),
        ["rooftop-bar"] = new ThemeConfig(
            "รูฟท็อปบาร์",
            "Rooftop Bars",
            "รวมรูฟท็อปบาร์วิวสวย บาร์ดาดฟ้า ที่นั่งกลางแจ้งบรรยากาศดี",
            "🌃",
            ["outdoor_seating"],
            []
        ),
        ["karaoke"] = new ThemeConfig(
            "คาราโอเกะ",
            "Karaoke",
            "รวมร้านคาราโอเกะ ร้องเพลง ปาร์ตี้กับเพื่อน",
            "🎤",
            ["karaoke"],
            []
        ),
        ["parking-available"] = new ThemeConfig(
            "ร้านมีที่จอดรถ",
            "Venues with Parking",
            "รวมร้านกลางคืนที่มีที่จอดรถสะดวก",
            "🅿️",
            ["parking"],
            []
        ),
        ["reservation"] = new ThemeConfig(
            "ร้านรับจอง",
            "Reservations Available",
            "รวมร้านกลางคืนที่รับจองโต๊ะล่วงหน้า",
            "📅",
            ["reservation"],
            []
        ),
        ["wifi"] = new ThemeConfig(
            "ร้านมี WiFi",
            "Venues with WiFi",
            "รวมร้านกลางคืนที่มี WiFi ฟรี",
            "📶",
            ["wifi"],
            []
        )
    };

    public SeoService(NightniceDbContext context, ILogger<SeoService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region View Tracking

    public async Task<bool> TrackViewAsync(Guid storeId, string? referrer, string? sessionHash)
    {
        try
        {
            // Check if store exists
            var storeExists = await _context.Stores.AnyAsync(s => s.Id == storeId && s.IsActive);
            if (!storeExists)
                return false;

            // Deduplicate by session within 1 hour
            if (!string.IsNullOrEmpty(sessionHash))
            {
                var recentView = await _context.StoreViews
                    .Where(v => v.StoreId == storeId &&
                                v.SessionHash == sessionHash &&
                                v.CreatedAt > DateTime.UtcNow.AddHours(-1))
                    .AnyAsync();

                if (recentView)
                    return true; // Already counted, but return success
            }

            var view = new StoreView
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                Referrer = referrer?.Length > 500 ? referrer[..500] : referrer,
                SessionHash = sessionHash,
                CreatedAt = DateTime.UtcNow
            };

            await _context.StoreViews.AddAsync(view);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking store view for {StoreId}", storeId);
            return false;
        }
    }

    #endregion

    #region Popular Stores

    public async Task<IEnumerable<PopularStoreDto>> GetPopularStoresAsync(
        string? provinceSlug = null,
        int count = 24)
    {
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories).ThenInclude(sc => sc.Category)
            .Include(s => s.Views)
            .Where(s => s.IsActive)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            query = query.Where(s => s.Province != null && s.Province.Slug == provinceSlug);
        }

        var stores = await query.ToListAsync();

        return stores
            .Select(s => new PopularStoreDto(
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
                s.Views.Count,
                s.Views.Count(v => v.CreatedAt >= weekAgo)
            ))
            .OrderByDescending(s => s.WeeklyViewCount)
            .ThenByDescending(s => s.ViewCount)
            .ThenByDescending(s => s.IsFeatured)
            .Take(count)
            .ToList();
    }

    public async Task<SeoPageMetaDto> GetPopularPageMetaAsync(string? provinceSlug = null)
    {
        var query = _context.Stores
            .Include(s => s.Province)
            .Where(s => s.IsActive);

        string title;
        string description;

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            var province = await _context.Provinces.FirstOrDefaultAsync(p => p.Slug == provinceSlug);
            if (province == null)
            {
                return new SeoPageMetaDto("ไม่พบจังหวัด", "", 0);
            }
            query = query.Where(s => s.Province.Slug == provinceSlug);
            title = $"ร้านยอดนิยมใน{province.Name}";
            description = $"รวมร้านกลางคืนยอดนิยมใน{province.Name} ที่มีผู้เข้าชมมากที่สุด บาร์ ผับ ร้านเหล้าแนะนำ";
        }
        else
        {
            title = "ร้านยอดนิยมทั่วประเทศไทย";
            description = "รวมร้านกลางคืนยอดนิยมทั่วไทย ที่มีผู้เข้าชมมากที่สุด บาร์ ผับ ร้านเหล้าแนะนำ";
        }

        var totalCount = await query.CountAsync();

        // Get province counts
        var provinceCounts = await _context.Stores
            .Include(s => s.Province)
            .Where(s => s.IsActive && s.Views.Any())
            .GroupBy(s => new { s.Province.Id, s.Province.Slug, s.Province.Name })
            .Select(g => new ProvinceCountDto(g.Key.Id, g.Key.Name, g.Key.Slug, g.Count()))
            .OrderByDescending(p => p.StoreCount)
            .Take(20)
            .ToListAsync();

        return new SeoPageMetaDto(title, description, totalCount, provinceCounts);
    }

    #endregion

    #region Late-Night Stores

    public async Task<IEnumerable<LateNightStoreDto>> GetLateNightStoresAsync(
        string? provinceSlug = null,
        int count = 24)
    {
        // Late-night = CloseTime between 00:00-06:00 (after midnight)
        var lateTimeStart = new TimeOnly(0, 0);
        var lateTimeEnd = new TimeOnly(6, 0);

        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories).ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive && s.CloseTime != null && s.OpenTime != null)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            query = query.Where(s => s.Province != null && s.Province.Slug == provinceSlug);
        }

        var stores = await query.ToListAsync();

        return stores
            .Where(s => s.CloseTime != null &&
                        s.CloseTime.Value >= lateTimeStart &&
                        s.CloseTime.Value <= lateTimeEnd)
            .OrderByDescending(s => s.IsFeatured)
            .ThenByDescending(s => s.CloseTime) // Later closing time first
            .Take(count)
            .Select(s => new LateNightStoreDto(
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
                s.OpenTime?.ToString("HH:mm") ?? "",
                s.CloseTime!.Value.ToString("HH:mm"),
                s.IsFeatured,
                true // IsOpenPastMidnight
            ))
            .ToList();
    }

    public async Task<SeoPageMetaDto> GetLateNightPageMetaAsync(string? provinceSlug = null)
    {
        var lateTimeStart = new TimeOnly(0, 0);
        var lateTimeEnd = new TimeOnly(6, 0);

        string title;
        string description;

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            var province = await _context.Provinces.FirstOrDefaultAsync(p => p.Slug == provinceSlug);
            if (province == null)
            {
                return new SeoPageMetaDto("ไม่พบจังหวัด", "", 0);
            }
            title = $"ร้านเปิดดึกใน{province.Name}";
            description = $"รวมร้านกลางคืนเปิดดึกใน{province.Name} สำหรับสายปาร์ตี้ เปิดถึงตี 2-6";
        }
        else
        {
            title = "ร้านเปิดดึกทั่วประเทศไทย";
            description = "รวมร้านกลางคืนเปิดดึกทั่วไทย สำหรับสายปาร์ตี้ เปิดถึงตี 2-6";
        }

        // Count late-night stores
        var stores = await _context.Stores
            .Where(s => s.IsActive && s.CloseTime != null)
            .Select(s => new { s.CloseTime, s.Province!.Slug })
            .ToListAsync();

        var lateNightStores = stores
            .Where(s => s.CloseTime != null &&
                        s.CloseTime.Value >= lateTimeStart &&
                        s.CloseTime.Value <= lateTimeEnd);

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            lateNightStores = lateNightStores.Where(s => s.Slug == provinceSlug);
        }

        var totalCount = lateNightStores.Count();

        return new SeoPageMetaDto(title, description, totalCount);
    }

    #endregion

    #region Themed Stores

    public async Task<IEnumerable<ThemedStoreDto>> GetThemedStoresAsync(
        string themeSlug,
        string? provinceSlug = null,
        int count = 24)
    {
        if (!ThemeDefinitions.TryGetValue(themeSlug, out var theme))
        {
            return [];
        }

        var query = _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories).ThenInclude(sc => sc.Category)
            .Where(s => s.IsActive)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(provinceSlug))
        {
            query = query.Where(s => s.Province != null && s.Province.Slug == provinceSlug);
        }

        var stores = await query.ToListAsync();

        // Filter by facilities or categories
        var filteredStores = stores.Where(s =>
        {
            var hasFacility = theme.Facilities.Length == 0 ||
                              theme.Facilities.Any(f => s.Facilities.Contains(f));
            var hasCategory = theme.Categories.Length == 0 ||
                              s.StoreCategories.Any(sc => theme.Categories.Contains(sc.Category.Slug));

            return theme.Facilities.Length > 0 ? hasFacility : hasCategory;
        });

        return filteredStores
            .OrderByDescending(s => s.IsFeatured)
            .ThenBy(s => s.Name)
            .Take(count)
            .Select(s => new ThemedStoreDto(
                s.Id,
                s.Name,
                s.Slug,
                s.Description,
                s.LogoUrl,
                s.BannerUrl,
                s.Province?.Name,
                s.Province?.Slug,
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.Facilities,
                s.PriceRange,
                s.OpenTime?.ToString("HH:mm"),
                s.CloseTime?.ToString("HH:mm"),
                s.IsFeatured
            ))
            .ToList();
    }

    public async Task<IEnumerable<ThemeDto>> GetAvailableThemesAsync()
    {
        var stores = await _context.Stores
            .Where(s => s.IsActive)
            .Select(s => s.Facilities)
            .ToListAsync();

        var themes = new List<ThemeDto>();

        foreach (var (slug, theme) in ThemeDefinitions)
        {
            var storeCount = stores.Count(facilities =>
                theme.Facilities.Any(f => facilities.Contains(f)));

            if (storeCount > 0)
            {
                themes.Add(new ThemeDto(
                    slug,
                    theme.TitleTh,
                    theme.TitleEn,
                    theme.Description,
                    theme.Icon,
                    storeCount
                ));
            }
        }

        return themes.OrderByDescending(t => t.StoreCount);
    }

    public ThemeConfig? GetThemeConfig(string themeSlug)
    {
        return ThemeDefinitions.GetValueOrDefault(themeSlug);
    }

    #endregion
}

/// <summary>
/// Configuration for a theme collection
/// </summary>
public record ThemeConfig(
    string TitleTh,
    string TitleEn,
    string Description,
    string Icon,
    string[] Facilities,
    string[] Categories
);
