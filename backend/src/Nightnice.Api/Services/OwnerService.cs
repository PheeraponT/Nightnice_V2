using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Data;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

public class OwnerService
{
    private readonly NightniceDbContext _context;

    public OwnerService(NightniceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Verify that the user owns the given store. Returns the store or null if not owned.
    /// </summary>
    public async Task<Store?> VerifyOwnershipAsync(Guid userId, Guid storeId)
    {
        return await _context.Stores
            .FirstOrDefaultAsync(s => s.Id == storeId && s.OwnerId == userId);
    }

    /// <summary>
    /// Get all stores owned by the user with key metrics.
    /// </summary>
    public async Task<IEnumerable<OwnerStoreListDto>> GetOwnedStoresAsync(Guid userId)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        var stores = await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Where(s => s.OwnerId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var storeIds = stores.Select(s => s.Id).ToList();

        // Batch load ratings for all owned stores
        var ratings = await _context.StoreRatings
            .Where(r => storeIds.Contains(r.StoreId))
            .ToDictionaryAsync(r => r.StoreId);

        // Batch load view counts for last 30 days
        var viewCounts = await _context.StoreViews
            .Where(v => storeIds.Contains(v.StoreId) && v.CreatedAt >= thirtyDaysAgo)
            .GroupBy(v => v.StoreId)
            .Select(g => new { StoreId = g.Key, Count = (long)g.Count() })
            .ToDictionaryAsync(x => x.StoreId, x => x.Count);

        return stores.Select(s =>
        {
            ratings.TryGetValue(s.Id, out var rating);
            viewCounts.TryGetValue(s.Id, out var views30d);

            return new OwnerStoreListDto(
                s.Id,
                s.Name,
                s.Slug,
                s.LogoUrl,
                s.Province?.Name ?? "",
                s.StoreCategories.Select(sc => sc.Category.Name),
                s.IsActive,
                rating?.TotalReviews ?? 0,
                rating?.AverageRating,
                views30d,
                s.CreatedAt
            );
        });
    }

    /// <summary>
    /// Get full store detail with analytics summary for an owned store.
    /// </summary>
    public async Task<OwnerStoreDetailDto?> GetOwnedStoreDetailAsync(Guid userId, Guid storeId)
    {
        var store = await _context.Stores
            .Include(s => s.Province)
            .Include(s => s.StoreCategories)
                .ThenInclude(sc => sc.Category)
            .Include(s => s.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(s => s.Id == storeId && s.OwnerId == userId);

        if (store == null)
            return null;

        var analytics = await BuildAnalyticsSummaryAsync(storeId);

        return new OwnerStoreDetailDto(
            store.Id,
            store.Name,
            store.Slug,
            store.Description,
            store.LogoUrl,
            store.BannerUrl,
            store.Province?.Name ?? "",
            store.StoreCategories.Select(sc => new CategoryInfoDto(sc.Category.Id, sc.Category.Name, sc.Category.Slug)),
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
            store.UpdatedAt,
            analytics
        );
    }

    /// <summary>
    /// Update allowed fields on an owned store.
    /// </summary>
    public async Task<OwnerStoreDetailDto?> UpdateOwnedStoreAsync(Guid userId, Guid storeId, OwnerStoreUpdateDto dto)
    {
        var store = await _context.Stores
            .FirstOrDefaultAsync(s => s.Id == storeId && s.OwnerId == userId);

        if (store == null)
            return null;

        // Only update allowed fields
        if (dto.Description != null) store.Description = dto.Description;
        if (dto.Phone != null) store.Phone = dto.Phone;
        if (dto.Address != null) store.Address = dto.Address;
        if (dto.GoogleMapUrl != null) store.GoogleMapUrl = dto.GoogleMapUrl;
        if (dto.LineId != null) store.LineId = dto.LineId;
        if (dto.FacebookUrl != null) store.FacebookUrl = dto.FacebookUrl;
        if (dto.InstagramUrl != null) store.InstagramUrl = dto.InstagramUrl;
        if (dto.PriceRange.HasValue) store.PriceRange = dto.PriceRange;
        if (dto.OpenTime != null) store.OpenTime = ParseTime(dto.OpenTime);
        if (dto.CloseTime != null) store.CloseTime = ParseTime(dto.CloseTime);
        if (dto.Facilities != null) store.Facilities = dto.Facilities.ToList();

        store.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetOwnedStoreDetailAsync(userId, storeId);
    }

    /// <summary>
    /// Get view analytics for a store grouped by day.
    /// </summary>
    public async Task<OwnerViewAnalyticsDto> GetViewAnalyticsAsync(Guid storeId, int days = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);

        var totalViews = await _context.StoreViews
            .Where(v => v.StoreId == storeId)
            .LongCountAsync();

        var dailyViews = await _context.StoreViews
            .Where(v => v.StoreId == storeId && v.CreatedAt >= cutoff)
            .GroupBy(v => v.CreatedAt.Date)
            .Select(g => new DailyViewDto(
                DateOnly.FromDateTime(g.Key),
                g.Count()
            ))
            .OrderBy(d => d.Date)
            .ToListAsync();

        return new OwnerViewAnalyticsDto(totalViews, dailyViews);
    }

    /// <summary>
    /// Get rating analytics with breakdown and recent reviews.
    /// </summary>
    public async Task<OwnerRatingAnalyticsDto> GetRatingAnalyticsAsync(Guid storeId)
    {
        var rating = await _context.StoreRatings
            .FirstOrDefaultAsync(r => r.StoreId == storeId);

        var recentReviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.StoreId == storeId && r.IsActive)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
            .Select(r => new OwnerReviewSummaryDto(
                r.Id,
                r.User.DisplayName,
                r.Rating,
                r.Title,
                r.Content.Length > 150 ? r.Content.Substring(0, 150) + "..." : r.Content,
                r.OwnerReply,
                r.OwnerReplyAt,
                r.CreatedAt
            ))
            .ToListAsync();

        return new OwnerRatingAnalyticsDto(
            rating?.AverageRating ?? 0,
            rating?.TotalReviews ?? 0,
            rating?.TotalRating5 ?? 0,
            rating?.TotalRating4 ?? 0,
            rating?.TotalRating3 ?? 0,
            rating?.TotalRating2 ?? 0,
            rating?.TotalRating1 ?? 0,
            recentReviews
        );
    }

    /// <summary>
    /// Get mood analytics for a store (same pattern as StoreRepository.GetMoodInsightAsync).
    /// </summary>
    public async Task<StoreMoodInsightDto?> GetMoodAnalyticsAsync(Guid storeId)
    {
        var feedbacks = await _context.StoreMoodFeedbacks
            .Where(f => f.StoreId == storeId)
            .Select(f => new
            {
                f.MoodCode,
                f.EnergyScore,
                f.MusicScore,
                f.CrowdScore,
                f.ConversationScore,
                f.CreativityScore,
                f.ServiceScore,
                f.HighlightQuote,
                f.UpdatedAt
            })
            .ToListAsync();

        if (feedbacks.Count == 0)
            return null;

        var total = feedbacks.Count;
        var grouped = feedbacks
            .GroupBy(f => f.MoodCode)
            .Select(g => new StoreMoodScoreDto(
                g.Key,
                Math.Round(((double)g.Count() / total) * 100, 1),
                g.Count()
            ))
            .OrderByDescending(m => m.Percentage)
            .ThenBy(m => m.MoodCode)
            .ToList();

        var vibeScores = new List<StoreVibeScoreDto>
        {
            new("energy", Math.Round(feedbacks.Average(f => f.EnergyScore), 1)),
            new("music", Math.Round(feedbacks.Average(f => f.MusicScore), 1)),
            new("crowd", Math.Round(feedbacks.Average(f => f.CrowdScore), 1)),
            new("conversation", Math.Round(feedbacks.Average(f => f.ConversationScore), 1)),
            new("creativity", Math.Round(feedbacks.Average(f => f.CreativityScore), 1)),
            new("service", Math.Round(feedbacks.Average(f => f.ServiceScore), 1))
        };

        var highlight = feedbacks
            .Where(f => !string.IsNullOrWhiteSpace(f.HighlightQuote))
            .OrderByDescending(f => f.UpdatedAt)
            .Select(f => f.HighlightQuote!.Trim())
            .FirstOrDefault();

        var lastUpdated = feedbacks.Max(f => f.UpdatedAt);

        var primary = grouped.FirstOrDefault();
        var secondary = grouped.Skip(1).FirstOrDefault();

        return new StoreMoodInsightDto(
            total,
            primary?.MoodCode,
            secondary?.MoodCode,
            primary != null ? (int)Math.Round(primary.Percentage) : 0,
            grouped,
            vibeScores,
            highlight,
            lastUpdated
        );
    }

    /// <summary>
    /// Create a reply to a review on an owned store.
    /// </summary>
    public async Task<bool> ReplyToReviewAsync(Guid storeId, Guid reviewId, string reply)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.StoreId == storeId && r.IsActive);

        if (review == null)
            return false;

        if (review.OwnerReply != null)
            return false; // Already has a reply; use update instead

        review.OwnerReply = reply;
        review.OwnerReplyAt = DateTime.UtcNow;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Update an existing owner reply on a review.
    /// </summary>
    public async Task<bool> UpdateReviewReplyAsync(Guid storeId, Guid reviewId, string reply)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.StoreId == storeId && r.IsActive);

        if (review == null)
            return false;

        if (review.OwnerReply == null)
            return false; // No existing reply to update; use create instead

        review.OwnerReply = reply;
        review.OwnerReplyAt = DateTime.UtcNow;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Delete the owner reply on a review.
    /// </summary>
    public async Task<bool> DeleteReviewReplyAsync(Guid storeId, Guid reviewId)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.StoreId == storeId && r.IsActive);

        if (review == null)
            return false;

        if (review.OwnerReply == null)
            return false; // Nothing to delete

        review.OwnerReply = null;
        review.OwnerReplyAt = null;
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    // --- Private helpers ---

    private async Task<OwnerAnalyticsSummaryDto> BuildAnalyticsSummaryAsync(Guid storeId)
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sevenDaysAgo = now.AddDays(-7);

        var totalViews = await _context.StoreViews
            .Where(v => v.StoreId == storeId)
            .LongCountAsync();

        var views30d = await _context.StoreViews
            .Where(v => v.StoreId == storeId && v.CreatedAt >= thirtyDaysAgo)
            .LongCountAsync();

        var views7d = await _context.StoreViews
            .Where(v => v.StoreId == storeId && v.CreatedAt >= sevenDaysAgo)
            .LongCountAsync();

        var rating = await _context.StoreRatings
            .FirstOrDefaultAsync(r => r.StoreId == storeId);

        var favoriteCount = await _context.UserFavoriteStores
            .Where(f => f.StoreId == storeId)
            .CountAsync();

        // Get primary mood
        var primaryMood = await _context.StoreMoodFeedbacks
            .Where(f => f.StoreId == storeId)
            .GroupBy(f => f.MoodCode)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        return new OwnerAnalyticsSummaryDto(
            totalViews,
            views30d,
            views7d,
            rating?.TotalReviews ?? 0,
            rating?.AverageRating ?? 0,
            favoriteCount,
            primaryMood
        );
    }

    private static TimeOnly? ParseTime(string? timeStr)
    {
        if (string.IsNullOrEmpty(timeStr))
            return null;

        if (TimeOnly.TryParse(timeStr, out var time))
            return time;

        return null;
    }
}
