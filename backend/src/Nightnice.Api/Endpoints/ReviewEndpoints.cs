using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;
using System.Security.Claims;

namespace Nightnice.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews")
            .WithTags("Reviews")
            .WithOpenApi();

        // Public endpoints
        group.MapGet("/store/{storeId:guid}", GetStoreReviews)
            .WithName("GetStoreReviews")
            .WithSummary("Get reviews for a store")
            .AllowAnonymous();

        group.MapGet("/store/{storeId:guid}/stats", GetReviewStats)
            .WithName("GetReviewStats")
            .WithSummary("Get review statistics for a store")
            .AllowAnonymous();

        // Protected endpoints (require Firebase auth)
        var protectedGroup = group.RequireAuthorization();

        protectedGroup.MapPost("", CreateReview)
            .WithName("CreateReview")
            .WithSummary("Create a new review");

        protectedGroup.MapPut("/{reviewId:guid}", UpdateReview)
            .WithName("UpdateReview")
            .WithSummary("Update your own review");

        protectedGroup.MapDelete("/{reviewId:guid}", DeleteReview)
            .WithName("DeleteReview")
            .WithSummary("Delete your own review");

        protectedGroup.MapPost("/helpful", ToggleHelpful)
            .WithName("ToggleHelpful")
            .WithSummary("Toggle helpful vote on a review");

        protectedGroup.MapPost("/report", ReportReview)
            .WithName("ReportReview")
            .WithSummary("Report an inappropriate review");

        // Admin endpoints
        var adminGroup = app.MapGroup("/api/admin/reviews")
            .WithTags("Admin - Reviews")
            .RequireAuthorization()
            .WithOpenApi();

        adminGroup.MapGet("", GetAllReviews)
            .WithName("AdminGetAllReviews")
            .WithSummary("Get all reviews (admin)");

        adminGroup.MapPut("/{reviewId:guid}", AdminUpdateReview)
            .WithName("AdminUpdateReview")
            .WithSummary("Update review (hide/show)");

        adminGroup.MapPost("/reports/{reportId:guid}/review", AdminReviewReport)
            .WithName("AdminReviewReport")
            .WithSummary("Process a review report");
    }

    // Public endpoint handlers
    private static async Task<IResult> GetStoreReviews(
        ReviewService reviewService,
        UserService userService,
        HttpContext context,
        Guid storeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "recent")
    {
        try
        {
            // Get current user ID if authenticated
            Guid? currentUserId = null;
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (!string.IsNullOrEmpty(firebaseUid))
            {
                var user = await userService.GetByFirebaseUidAsync(firebaseUid);
                currentUserId = user?.Id;
            }

            var result = await reviewService.GetStoreReviewsAsync(storeId, currentUserId, page, pageSize, sortBy);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> GetReviewStats(
        ReviewService reviewService,
        Guid storeId)
    {
        try
        {
            var stats = await reviewService.GetReviewStatsAsync(storeId);
            return Results.Ok(stats);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    // Protected endpoint handlers
    private static async Task<IResult> CreateReview(
        [FromBody] ReviewCreateDto createDto,
        ReviewService reviewService,
        UserService userService,
        HttpContext context,
        IValidator<ReviewCreateDto> validator)
    {
        try
        {
            // Validate
            var validationResult = await validator.ValidateAsync(createDto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(new
                {
                    errors = validationResult.Errors.Select(e => e.ErrorMessage)
                });
            }

            // Get user from Firebase UID
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Results.Unauthorized();
            }

            var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await userService.GetOrCreateUserAsync(
                firebaseUid,
                email,
                displayName,
                null,
                "google.com"
            );

            var result = await reviewService.CreateReviewAsync(user.Id, createDto);
            return Results.Created($"/api/reviews/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> UpdateReview(
        Guid reviewId,
        [FromBody] ReviewUpdateDto updateDto,
        ReviewService reviewService,
        UserService userService,
        HttpContext context,
        IValidator<ReviewUpdateDto> validator)
    {
        try
        {
            // Validate
            var validationResult = await validator.ValidateAsync(updateDto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(new
                {
                    errors = validationResult.Errors.Select(e => e.ErrorMessage)
                });
            }

            // Get user
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Results.Unauthorized();
            }

            var user = await userService.GetByFirebaseUidAsync(firebaseUid);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var result = await reviewService.UpdateReviewAsync(reviewId, user.Id, updateDto);
            if (result == null)
            {
                return Results.NotFound(new { message = "Review not found" });
            }

            return Results.Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> DeleteReview(
        Guid reviewId,
        ReviewService reviewService,
        UserService userService,
        HttpContext context)
    {
        try
        {
            // Get user
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Results.Unauthorized();
            }

            var user = await userService.GetByFirebaseUidAsync(firebaseUid);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            var result = await reviewService.DeleteReviewAsync(reviewId, user.Id);
            if (!result)
            {
                return Results.NotFound(new { message = "Review not found" });
            }

            return Results.Ok(new { message = "Review deleted successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> ToggleHelpful(
        [FromBody] ReviewHelpfulToggleDto dto,
        ReviewService reviewService,
        UserService userService,
        HttpContext context)
    {
        try
        {
            // Get user
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Results.Unauthorized();
            }

            var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await userService.GetOrCreateUserAsync(
                firebaseUid,
                email,
                displayName,
                null,
                "google.com"
            );

            var isHelpful = await reviewService.ToggleHelpfulAsync(dto.ReviewId, user.Id);
            return Results.Ok(new { isHelpful });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> ReportReview(
        [FromBody] ReviewReportDto reportDto,
        ReviewService reviewService,
        UserService userService,
        HttpContext context,
        IValidator<ReviewReportDto> validator)
    {
        try
        {
            // Validate
            var validationResult = await validator.ValidateAsync(reportDto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(new
                {
                    errors = validationResult.Errors.Select(e => e.ErrorMessage)
                });
            }

            // Get user
            var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Results.Unauthorized();
            }

            var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "";
            var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await userService.GetOrCreateUserAsync(
                firebaseUid,
                email,
                displayName,
                null,
                "google.com"
            );

            await reviewService.ReportReviewAsync(user.Id, reportDto);
            return Results.Ok(new { message = "Review reported successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    // Admin endpoint handlers
    private static async Task<IResult> GetAllReviews(
        ReviewService reviewService,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? storeId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? hasReports = null)
    {
        try
        {
            var result = await reviewService.GetAllReviewsAsync(page, pageSize, storeId, isActive, hasReports);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> AdminUpdateReview(
        Guid reviewId,
        [FromBody] AdminReviewUpdateDto updateDto,
        ReviewService reviewService)
    {
        try
        {
            var result = await reviewService.AdminUpdateReviewAsync(reviewId, updateDto);
            if (!result)
            {
                return Results.NotFound(new { message = "Review not found" });
            }

            return Results.Ok(new { message = "Review updated successfully" });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> AdminReviewReport(
        Guid reportId,
        [FromBody] AdminReportReviewDto dto,
        ReviewService reviewService,
        HttpContext context)
    {
        try
        {
            // Get admin ID from JWT claims
            var adminIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(adminIdStr, out var adminId))
            {
                return Results.Unauthorized();
            }

            var result = await reviewService.AdminReviewReportAsync(adminId, dto);
            if (!result)
            {
                return Results.NotFound(new { message = "Report not found" });
            }

            return Results.Ok(new { message = "Report processed successfully" });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }
}
