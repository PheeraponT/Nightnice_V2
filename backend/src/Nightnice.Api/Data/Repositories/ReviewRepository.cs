using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class ReviewRepository
{
    private readonly NightniceDbContext _context;

    public ReviewRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ReviewDto>> GetStoreReviewsAsync(
        Guid storeId,
        Guid? currentUserId,
        int page,
        int pageSize,
        string sortBy)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Where(r => r.StoreId == storeId && r.IsActive)
            .AsQueryable();

        // Apply sorting
        query = sortBy.ToLower() switch
        {
            "helpful" => query.OrderByDescending(r => r.HelpfulCount),
            "rating_high" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            "rating_low" => query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt) // "recent" (default)
        };

        var totalCount = await query.CountAsync();

        var reviews = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                Review = r,
                IsHelpful = currentUserId.HasValue &&
                           _context.ReviewHelpfuls.Any(rh => rh.ReviewId == r.Id && rh.UserId == currentUserId.Value)
            })
            .ToListAsync();

        var items = reviews.Select(r => new ReviewDto(
            r.Review.Id,
            r.Review.StoreId,
            new UserBasicDto(
                r.Review.User.DisplayName ?? "Anonymous",
                r.Review.User.PhotoUrl
            ),
            r.Review.Rating,
            r.Review.Title,
            r.Review.Content,
            r.Review.HelpfulCount,
            r.IsHelpful,
            r.Review.CreatedAt,
            r.Review.UpdatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new PaginatedResult<ReviewDto>(
            items,
            totalCount,
            page,
            pageSize,
            totalPages
        );
    }

    public async Task<ReviewStatsDto> GetReviewStatsAsync(Guid storeId)
    {
        var storeRating = await _context.StoreRatings
            .FirstOrDefaultAsync(sr => sr.StoreId == storeId);

        if (storeRating == null)
        {
            return new ReviewStatsDto(0, 0, 0, 0, 0, 0, 0);
        }

        return new ReviewStatsDto(
            storeRating.AverageRating,
            storeRating.TotalReviews,
            storeRating.TotalRating5,
            storeRating.TotalRating4,
            storeRating.TotalRating3,
            storeRating.TotalRating2,
            storeRating.TotalRating1
        );
    }

    public async Task<Review?> GetByIdAsync(Guid reviewId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == reviewId);
    }

    public async Task<bool> HasUserReviewedStoreAsync(Guid userId, Guid storeId)
    {
        return await _context.Reviews
            .AnyAsync(r => r.UserId == userId && r.StoreId == storeId && r.IsActive);
    }

    public async Task<ReviewDto> CreateAsync(Guid userId, ReviewCreateDto createDto)
    {
        var review = new Review
        {
            Id = Guid.NewGuid(),
            StoreId = createDto.StoreId,
            UserId = userId,
            Rating = createDto.Rating,
            Title = createDto.Title,
            Content = createDto.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        if (createDto.MoodFeedback != null)
        {
            await UpsertMoodFeedbackAsync(createDto.StoreId, userId, review.Id, createDto.MoodFeedback);
        }

        // Save the review first
        await _context.SaveChangesAsync();

        // Then update StoreRating with the new review included
        await UpdateStoreRatingAsync(createDto.StoreId);
        await _context.SaveChangesAsync();

        // Fetch the created review with user info
        var createdReview = await _context.Reviews
            .Include(r => r.User)
            .FirstAsync(r => r.Id == review.Id);

        return new ReviewDto(
            createdReview.Id,
            createdReview.StoreId,
            new UserBasicDto(
                createdReview.User.DisplayName ?? "Anonymous",
                createdReview.User.PhotoUrl
            ),
            createdReview.Rating,
            createdReview.Title,
            createdReview.Content,
            0, // HelpfulCount starts at 0
            false, // IsHelpfulByCurrentUser
            createdReview.CreatedAt,
            createdReview.UpdatedAt
        );
    }

    public async Task<ReviewDto?> UpdateAsync(Guid reviewId, ReviewUpdateDto updateDto)
    {
        var review = await GetByIdAsync(reviewId);
        if (review == null) return null;

        var oldRating = review.Rating;

        review.Rating = updateDto.Rating;
        review.Title = updateDto.Title;
        review.Content = updateDto.Content;
        review.UpdatedAt = DateTime.UtcNow;

        if (updateDto.MoodFeedback != null)
        {
            await UpsertMoodFeedbackAsync(review.StoreId, review.UserId, review.Id, updateDto.MoodFeedback);
        }

        // If rating changed, update StoreRating
        if (oldRating != updateDto.Rating)
        {
            await UpdateStoreRatingAsync(review.StoreId);
        }

        await _context.SaveChangesAsync();

        return new ReviewDto(
            review.Id,
            review.StoreId,
            new UserBasicDto(
                review.User.DisplayName ?? "Anonymous",
                review.User.PhotoUrl
            ),
            review.Rating,
            review.Title,
            review.Content,
            review.HelpfulCount,
            false,
            review.CreatedAt,
            review.UpdatedAt
        );
    }

    public async Task<bool> DeleteAsync(Guid reviewId)
    {
        var review = await GetByIdAsync(reviewId);
        if (review == null) return false;

        review.IsActive = false;
        review.UpdatedAt = DateTime.UtcNow;

        var moodFeedback = await _context.StoreMoodFeedbacks
            .FirstOrDefaultAsync(m => m.ReviewId == reviewId);
        if (moodFeedback != null)
        {
            _context.StoreMoodFeedbacks.Remove(moodFeedback);
        }

        await UpdateStoreRatingAsync(review.StoreId);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ToggleHelpfulAsync(Guid reviewId, Guid userId)
    {
        var existing = await _context.ReviewHelpfuls
            .FirstOrDefaultAsync(rh => rh.ReviewId == reviewId && rh.UserId == userId);

        if (existing != null)
        {
            // Remove helpful vote
            _context.ReviewHelpfuls.Remove(existing);

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review != null)
            {
                review.HelpfulCount = Math.Max(0, review.HelpfulCount - 1);
            }
        }
        else
        {
            // Add helpful vote
            _context.ReviewHelpfuls.Add(new ReviewHelpful
            {
                ReviewId = reviewId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review != null)
            {
                review.HelpfulCount++;
            }
        }

        await _context.SaveChangesAsync();
        return existing == null; // Return true if voted helpful, false if removed vote
    }

    public async Task<bool> HasUserReportedReviewAsync(Guid userId, Guid reviewId)
    {
        return await _context.ReviewReports
            .AnyAsync(rr => rr.ReportedByUserId == userId && rr.ReviewId == reviewId);
    }

    public async Task<bool> CreateReportAsync(Guid userId, ReviewReportDto reportDto)
    {
        var report = new ReviewReport
        {
            Id = Guid.NewGuid(),
            ReviewId = reportDto.ReviewId,
            ReportedByUserId = userId,
            Reason = reportDto.Reason,
            Description = reportDto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.ReviewReports.Add(report);

        // Update review report count
        var review = await _context.Reviews.FindAsync(reportDto.ReviewId);
        if (review != null)
        {
            review.ReportCount++;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private async Task UpdateStoreRatingAsync(Guid storeId)
    {
        var activeReviews = await _context.Reviews
            .Where(r => r.StoreId == storeId && r.IsActive)
            .ToListAsync();

        var totalReviews = activeReviews.Count;
        var averageRating = totalReviews > 0
            ? (decimal)activeReviews.Average(r => r.Rating)
            : 0;

        var rating5 = activeReviews.Count(r => r.Rating == 5);
        var rating4 = activeReviews.Count(r => r.Rating == 4);
        var rating3 = activeReviews.Count(r => r.Rating == 3);
        var rating2 = activeReviews.Count(r => r.Rating == 2);
        var rating1 = activeReviews.Count(r => r.Rating == 1);

        var storeRating = await _context.StoreRatings.FindAsync(storeId);

        if (storeRating == null)
        {
            storeRating = new StoreRating
            {
                StoreId = storeId,
                AverageRating = averageRating,
                TotalReviews = totalReviews,
                TotalRating5 = rating5,
                TotalRating4 = rating4,
                TotalRating3 = rating3,
                TotalRating2 = rating2,
                TotalRating1 = rating1,
                UpdatedAt = DateTime.UtcNow
            };
            _context.StoreRatings.Add(storeRating);
        }
        else
        {
            storeRating.AverageRating = averageRating;
            storeRating.TotalReviews = totalReviews;
            storeRating.TotalRating5 = rating5;
            storeRating.TotalRating4 = rating4;
            storeRating.TotalRating3 = rating3;
            storeRating.TotalRating2 = rating2;
            storeRating.TotalRating1 = rating1;
            storeRating.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task UpsertMoodFeedbackAsync(Guid storeId, Guid userId, Guid reviewId, MoodFeedbackInputDto moodDto)
    {
        var normalizedMood = moodDto.MoodCode.Trim().ToLowerInvariant();
        var existing = await _context.StoreMoodFeedbacks
            .FirstOrDefaultAsync(m => m.StoreId == storeId && m.UserId == userId);

        if (existing == null)
        {
            existing = new StoreMoodFeedback
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                UserId = userId,
                MoodCode = normalizedMood,
                CreatedAt = DateTime.UtcNow
            };
            _context.StoreMoodFeedbacks.Add(existing);
        }
        else
        {
            existing.MoodCode = normalizedMood;
        }

        existing.ReviewId = reviewId;
        existing.EnergyScore = moodDto.EnergyScore;
        existing.MusicScore = moodDto.MusicScore;
        existing.CrowdScore = moodDto.CrowdScore;
        existing.ConversationScore = moodDto.ConversationScore;
        existing.CreativityScore = moodDto.CreativityScore;
        existing.ServiceScore = moodDto.ServiceScore;
        existing.HighlightQuote = string.IsNullOrWhiteSpace(moodDto.HighlightQuote)
            ? null
            : moodDto.HighlightQuote.Trim();
        existing.UpdatedAt = DateTime.UtcNow;
    }

    // Admin methods
    public async Task<PaginatedResult<AdminReviewListDto>> GetAllReviewsAsync(
        int page,
        int pageSize,
        Guid? storeId,
        bool? isActive,
        bool? hasReports)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Store)
            .AsQueryable();

        if (storeId.HasValue)
            query = query.Where(r => r.StoreId == storeId.Value);

        if (isActive.HasValue)
            query = query.Where(r => r.IsActive == isActive.Value);

        if (hasReports.HasValue && hasReports.Value)
            query = query.Where(r => r.ReportCount > 0);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = reviews.Select(r => new AdminReviewListDto(
            r.Id,
            r.StoreId,
            r.Store.Name,
            new UserBasicDto(r.User.DisplayName ?? "Anonymous", r.User.PhotoUrl),
            r.Rating,
            r.Content.Length > 100 ? r.Content.Substring(0, 100) + "..." : r.Content,
            r.HelpfulCount,
            r.ReportCount,
            r.IsActive,
            r.CreatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new PaginatedResult<AdminReviewListDto>(
            items,
            totalCount,
            page,
            pageSize,
            totalPages
        );
    }

    public async Task<bool> AdminUpdateAsync(Guid reviewId, AdminReviewUpdateDto updateDto)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return false;

        if (updateDto.IsActive.HasValue)
        {
            review.IsActive = updateDto.IsActive.Value;
            // Update store rating if visibility changed
            await UpdateStoreRatingAsync(review.StoreId);
        }

        if (updateDto.AdminNote != null)
            review.AdminNote = updateDto.AdminNote;

        review.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AdminReviewReportAsync(Guid adminId, AdminReportReviewDto dto)
    {
        var report = await _context.ReviewReports.FindAsync(dto.ReportId);
        if (report == null) return false;

        report.IsReviewed = true;
        report.ReviewedByAdminId = adminId;
        report.ReviewedAt = DateTime.UtcNow;
        report.AdminAction = dto.AdminAction;
        report.AdminNotes = dto.AdminNotes;

        // Handle admin action
        if (dto.AdminAction == "hidden")
        {
            var review = await _context.Reviews.FindAsync(report.ReviewId);
            if (review != null)
            {
                review.IsActive = false;
                await UpdateStoreRatingAsync(review.StoreId);
            }
        }
        else if (dto.AdminAction == "banned_user")
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == report.ReviewId);

            if (review != null)
            {
                review.User.IsBanned = true;
                review.User.BanReason = "Review violation";
                review.IsActive = false;
                await UpdateStoreRatingAsync(review.StoreId);
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
