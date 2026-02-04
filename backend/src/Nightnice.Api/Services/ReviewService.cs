using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Services;

public class ReviewService
{
    private readonly ReviewRepository _reviewRepository;
    private readonly UserService _userService;

    public ReviewService(ReviewRepository reviewRepository, UserService userService)
    {
        _reviewRepository = reviewRepository;
        _userService = userService;
    }

    // Get reviews for a store
    public async Task<PaginatedResult<ReviewDto>> GetStoreReviewsAsync(
        Guid storeId,
        Guid? currentUserId,
        int page = 1,
        int pageSize = 10,
        string sortBy = "recent")
    {
        var validatedPage = Math.Max(1, page);
        var validatedPageSize = Math.Clamp(pageSize, 1, 50);

        return await _reviewRepository.GetStoreReviewsAsync(
            storeId,
            currentUserId,
            validatedPage,
            validatedPageSize,
            sortBy
        );
    }

    // Get review statistics
    public async Task<ReviewStatsDto> GetReviewStatsAsync(Guid storeId)
    {
        return await _reviewRepository.GetReviewStatsAsync(storeId);
    }

    // Create review
    public async Task<ReviewDto> CreateReviewAsync(Guid userId, ReviewCreateDto createDto)
    {
        // Check if user is banned
        if (await _userService.IsBannedAsync(userId))
        {
            throw new InvalidOperationException("User is banned from posting reviews");
        }

        // Check if user already reviewed this store
        if (await _reviewRepository.HasUserReviewedStoreAsync(userId, createDto.StoreId))
        {
            throw new InvalidOperationException("You have already reviewed this store");
        }

        return await _reviewRepository.CreateAsync(userId, createDto);
    }

    // Update review (only by owner)
    public async Task<ReviewDto?> UpdateReviewAsync(Guid reviewId, Guid userId, ReviewUpdateDto updateDto)
    {
        var review = await _reviewRepository.GetByIdAsync(reviewId);

        if (review == null)
            return null;

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only edit your own reviews");

        return await _reviewRepository.UpdateAsync(reviewId, updateDto);
    }

    // Delete review (only by owner)
    public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId)
    {
        var review = await _reviewRepository.GetByIdAsync(reviewId);

        if (review == null)
            return false;

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own reviews");

        return await _reviewRepository.DeleteAsync(reviewId);
    }

    // Toggle helpful vote
    public async Task<bool> ToggleHelpfulAsync(Guid reviewId, Guid userId)
    {
        return await _reviewRepository.ToggleHelpfulAsync(reviewId, userId);
    }

    // Report review
    public async Task<bool> ReportReviewAsync(Guid userId, ReviewReportDto reportDto)
    {
        // Check if user already reported this review
        if (await _reviewRepository.HasUserReportedReviewAsync(userId, reportDto.ReviewId))
        {
            throw new InvalidOperationException("You have already reported this review");
        }

        return await _reviewRepository.CreateReportAsync(userId, reportDto);
    }

    // Admin: Get all reviews
    public async Task<PaginatedResult<AdminReviewListDto>> GetAllReviewsAsync(
        int page = 1,
        int pageSize = 20,
        Guid? storeId = null,
        bool? isActive = null,
        bool? hasReports = null)
    {
        var validatedPage = Math.Max(1, page);
        var validatedPageSize = Math.Clamp(pageSize, 1, 100);

        return await _reviewRepository.GetAllReviewsAsync(
            validatedPage,
            validatedPageSize,
            storeId,
            isActive,
            hasReports
        );
    }

    // Admin: Update review (hide/show)
    public async Task<bool> AdminUpdateReviewAsync(Guid reviewId, AdminReviewUpdateDto updateDto)
    {
        return await _reviewRepository.AdminUpdateAsync(reviewId, updateDto);
    }

    // Admin: Review report
    public async Task<bool> AdminReviewReportAsync(Guid adminId, AdminReportReviewDto dto)
    {
        return await _reviewRepository.AdminReviewReportAsync(adminId, dto);
    }
}
