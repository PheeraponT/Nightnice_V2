using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

// T097: Ad repository with targeting logic
public class AdRepository
{
    private readonly NightniceDbContext _context;

    public AdRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AdListDto>> GetTargetedAdsAsync(AdTargetingParams targeting)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Advertisements
            .Include(a => a.Store)
            .Where(a => a.IsActive &&
                        a.StartDate <= today &&
                        a.EndDate >= today)
            .AsQueryable();

        // Filter by ad type if specified
        if (!string.IsNullOrWhiteSpace(targeting.AdType))
        {
            if (Enum.TryParse<AdType>(targeting.AdType, true, out var adType))
            {
                query = query.Where(a => a.Type == adType);
            }
        }

        // Filter by province targeting (show ads with no targeting = show everywhere)
        if (!string.IsNullOrWhiteSpace(targeting.ProvinceSlug))
        {
            query = query.Where(a => a.TargetProvinces.Count == 0);
        }

        // Filter by category targeting
        if (!string.IsNullOrWhiteSpace(targeting.CategorySlug))
        {
            query = query.Where(a => a.TargetCategories.Count == 0);
        }

        return await query
            .OrderBy(a => Guid.NewGuid()) // Random order
            .Take(targeting.Limit)
            .Select(a => new AdListDto(
                a.Id,
                a.Title ?? (a.Store != null ? a.Store.Name : "โฆษณา"),
                a.ImageUrl,
                a.TargetUrl,
                a.Type.ToString().ToLower(),
                a.StoreId,
                a.Store != null ? a.Store.Name : null,
                a.Store != null ? a.Store.Slug : null,
                a.Store != null ? a.Store.LogoUrl : null,
                0
            ))
            .ToListAsync();
    }

    public async Task<Advertisement?> GetByIdAsync(Guid id)
    {
        return await _context.Advertisements.FindAsync(id);
    }

    public async Task RecordMetricAsync(Guid adId, AdEventType eventType, string? pageContext)
    {
        var metric = new AdMetric
        {
            Id = Guid.NewGuid(),
            AdId = adId,
            EventType = eventType,
            PageContext = pageContext,
            CreatedAt = DateTime.UtcNow
        };

        _context.AdMetrics.Add(metric);
        await _context.SaveChangesAsync();
    }

    // T140: Admin ad methods
    public async Task<IEnumerable<AdminAdListDto>> GetAdminAdsAsync()
    {
        return await _context.Advertisements
            .Include(a => a.Store)
            .Include(a => a.Metrics)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdminAdListDto(
                a.Id,
                a.Type.ToString().ToLower(),
                a.Title ?? (a.Store != null ? a.Store.Name : null),
                a.StoreId,
                a.Store != null ? a.Store.Name : null,
                a.ImageUrl,
                a.StartDate,
                a.EndDate,
                a.IsActive,
                0, // Priority not in current model
                a.Metrics.Count(m => m.EventType == AdEventType.Impression),
                a.Metrics.Count(m => m.EventType == AdEventType.Click),
                a.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<AdminAdDto?> GetAdminAdByIdAsync(Guid id)
    {
        return await _context.Advertisements
            .Include(a => a.Store)
            .Where(a => a.Id == id)
            .Select(a => new AdminAdDto(
                a.Id,
                a.Type.ToString().ToLower(),
                a.Title,
                a.StoreId,
                a.Store != null ? a.Store.Name : null,
                a.ImageUrl,
                a.TargetUrl,
                a.TargetProvinces,
                a.TargetCategories,
                a.StartDate,
                a.EndDate,
                a.IsActive,
                0,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<AdminAdDto> CreateAsync(AdCreateDto createDto)
    {
        var adType = Enum.Parse<AdType>(createDto.AdType, ignoreCase: true);

        var ad = new Advertisement
        {
            Id = Guid.NewGuid(),
            Type = adType,
            Title = createDto.Title,
            StoreId = createDto.StoreId,
            ImageUrl = createDto.ImageUrl,
            TargetUrl = createDto.TargetUrl,
            TargetProvinces = createDto.TargetProvinces?.ToList() ?? [],
            TargetCategories = createDto.TargetCategories?.ToList() ?? [],
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Advertisements.Add(ad);
        await _context.SaveChangesAsync();

        return (await GetAdminAdByIdAsync(ad.Id))!;
    }

    public async Task<AdminAdDto?> UpdateAsync(Guid id, AdUpdateDto updateDto)
    {
        var ad = await _context.Advertisements.FindAsync(id);
        if (ad == null)
            return null;

        if (updateDto.AdType != null)
            ad.Type = Enum.Parse<AdType>(updateDto.AdType, ignoreCase: true);
        if (updateDto.Title != null)
            ad.Title = updateDto.Title;
        if (updateDto.StoreId.HasValue)
            ad.StoreId = updateDto.StoreId;
        if (updateDto.ImageUrl != null)
            ad.ImageUrl = updateDto.ImageUrl;
        if (updateDto.TargetUrl != null)
            ad.TargetUrl = updateDto.TargetUrl;
        if (updateDto.TargetProvinces != null)
            ad.TargetProvinces = updateDto.TargetProvinces.ToList();
        if (updateDto.TargetCategories != null)
            ad.TargetCategories = updateDto.TargetCategories.ToList();
        if (updateDto.StartDate.HasValue)
            ad.StartDate = updateDto.StartDate.Value;
        if (updateDto.EndDate.HasValue)
            ad.EndDate = updateDto.EndDate.Value;
        if (updateDto.IsActive.HasValue)
            ad.IsActive = updateDto.IsActive.Value;

        ad.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetAdminAdByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var ad = await _context.Advertisements
            .Include(a => a.Metrics)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (ad == null)
            return false;

        // Remove metrics first
        _context.AdMetrics.RemoveRange(ad.Metrics);
        _context.Advertisements.Remove(ad);
        await _context.SaveChangesAsync();
        return true;
    }

    // T141: Ad metrics
    public async Task<AdMetricsSummaryDto?> GetMetricsAsync(Guid adId, int days = 30)
    {
        var ad = await _context.Advertisements
            .Include(a => a.Store)
            .FirstOrDefaultAsync(a => a.Id == adId);

        if (ad == null)
            return null;

        var startDate = DateTime.UtcNow.AddDays(-days);

        var metrics = await _context.AdMetrics
            .Where(m => m.AdId == adId && m.CreatedAt >= startDate)
            .ToListAsync();

        var totalImpressions = metrics.Count(m => m.EventType == AdEventType.Impression);
        var totalClicks = metrics.Count(m => m.EventType == AdEventType.Click);
        var ctr = totalImpressions > 0 ? (double)totalClicks / totalImpressions * 100 : 0;

        var dailyMetrics = metrics
            .GroupBy(m => DateOnly.FromDateTime(m.CreatedAt))
            .Select(g => new DailyMetricDto(
                g.Key,
                g.Count(m => m.EventType == AdEventType.Impression),
                g.Count(m => m.EventType == AdEventType.Click)
            ))
            .OrderBy(d => d.Date)
            .ToList();

        return new AdMetricsSummaryDto(
            adId,
            ad.Title ?? ad.Store?.Name,
            totalImpressions,
            totalClicks,
            Math.Round(ctr, 2),
            dailyMetrics
        );
    }
}
