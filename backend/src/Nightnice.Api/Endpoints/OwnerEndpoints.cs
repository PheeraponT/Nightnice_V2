using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class OwnerEndpoints
{
    public static void MapOwnerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/owner")
            .WithTags("Owner Dashboard")
            .WithOpenApi()
            .RequireAuthorization();

        // Store management
        group.MapGet("/stores", GetOwnedStores)
            .WithName("GetOwnedStores")
            .WithSummary("List all stores owned by the current user");

        group.MapGet("/stores/{storeId:guid}", GetOwnedStoreDetail)
            .WithName("GetOwnedStoreDetail")
            .WithSummary("Get full detail of an owned store with analytics");

        group.MapPut("/stores/{storeId:guid}", UpdateOwnedStore)
            .WithName("UpdateOwnedStore")
            .WithSummary("Update allowed fields on an owned store");

        // Analytics
        group.MapGet("/stores/{storeId:guid}/analytics/views", GetViewAnalytics)
            .WithName("GetOwnerViewAnalytics")
            .WithSummary("Get view analytics for an owned store");

        group.MapGet("/stores/{storeId:guid}/analytics/ratings", GetRatingAnalytics)
            .WithName("GetOwnerRatingAnalytics")
            .WithSummary("Get rating analytics for an owned store");

        group.MapGet("/stores/{storeId:guid}/analytics/mood", GetMoodAnalytics)
            .WithName("GetOwnerMoodAnalytics")
            .WithSummary("Get mood analytics for an owned store");

        // Review reply management
        group.MapPost("/stores/{storeId:guid}/reviews/{reviewId:guid}/reply", CreateReviewReply)
            .WithName("CreateOwnerReviewReply")
            .WithSummary("Reply to a review on an owned store");

        group.MapPut("/stores/{storeId:guid}/reviews/{reviewId:guid}/reply", UpdateReviewReply)
            .WithName("UpdateOwnerReviewReply")
            .WithSummary("Update an existing reply on a review");

        group.MapDelete("/stores/{storeId:guid}/reviews/{reviewId:guid}/reply", DeleteReviewReply)
            .WithName("DeleteOwnerReviewReply")
            .WithSummary("Delete a reply on a review");
    }

    // --- Endpoint handlers ---

    private static async Task<IResult> GetOwnedStores(
        OwnerService ownerService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var stores = await ownerService.GetOwnedStoresAsync(user.Id);
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetOwnedStoreDetail(
        Guid storeId,
        OwnerService ownerService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์เข้าถึงร้านนี้" }, statusCode: 403);

        var detail = await ownerService.GetOwnedStoreDetailAsync(user.Id, storeId);
        if (detail == null)
            return Results.NotFound(new { message = "ไม่พบข้อมูลร้าน" });

        return Results.Ok(detail);
    }

    private static async Task<IResult> UpdateOwnedStore(
        Guid storeId,
        [FromBody] OwnerStoreUpdateDto dto,
        OwnerService ownerService,
        UserService userService,
        HttpContext context,
        IValidator<OwnerStoreUpdateDto> validator)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        // Validate input
        var validationResult = await validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new
            {
                errors = validationResult.Errors.Select(e => e.ErrorMessage)
            });
        }

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์แก้ไขร้านนี้" }, statusCode: 403);

        var updated = await ownerService.UpdateOwnedStoreAsync(user.Id, storeId, dto);
        if (updated == null)
            return Results.NotFound(new { message = "ไม่พบข้อมูลร้าน" });

        return Results.Ok(updated);
    }

    private static async Task<IResult> GetViewAnalytics(
        Guid storeId,
        OwnerService ownerService,
        UserService userService,
        HttpContext context,
        [FromQuery] int days = 30)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์เข้าถึงร้านนี้" }, statusCode: 403);

        var clampedDays = Math.Clamp(days, 1, 365);
        var analytics = await ownerService.GetViewAnalyticsAsync(storeId, clampedDays);
        return Results.Ok(analytics);
    }

    private static async Task<IResult> GetRatingAnalytics(
        Guid storeId,
        OwnerService ownerService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์เข้าถึงร้านนี้" }, statusCode: 403);

        var analytics = await ownerService.GetRatingAnalyticsAsync(storeId);
        return Results.Ok(analytics);
    }

    private static async Task<IResult> GetMoodAnalytics(
        Guid storeId,
        OwnerService ownerService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์เข้าถึงร้านนี้" }, statusCode: 403);

        var analytics = await ownerService.GetMoodAnalyticsAsync(storeId);
        return Results.Ok(analytics ?? new StoreMoodInsightDto(0, null, null, 0, [], [], null, null));
    }

    private static async Task<IResult> CreateReviewReply(
        Guid storeId,
        Guid reviewId,
        [FromBody] OwnerReviewReplyDto dto,
        OwnerService ownerService,
        UserService userService,
        HttpContext context,
        IValidator<OwnerReviewReplyDto> validator)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var validationResult = await validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new
            {
                errors = validationResult.Errors.Select(e => e.ErrorMessage)
            });
        }

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์ตอบรีวิวร้านนี้" }, statusCode: 403);

        var success = await ownerService.ReplyToReviewAsync(storeId, reviewId, dto.Reply);
        if (!success)
            return Results.BadRequest(new { message = "ไม่สามารถตอบรีวิวได้ (อาจมีการตอบแล้ว หรือไม่พบรีวิว)" });

        return Results.Ok(new { message = "ตอบรีวิวสำเร็จ" });
    }

    private static async Task<IResult> UpdateReviewReply(
        Guid storeId,
        Guid reviewId,
        [FromBody] OwnerReviewReplyDto dto,
        OwnerService ownerService,
        UserService userService,
        HttpContext context,
        IValidator<OwnerReviewReplyDto> validator)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var validationResult = await validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new
            {
                errors = validationResult.Errors.Select(e => e.ErrorMessage)
            });
        }

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์แก้ไขการตอบรีวิวร้านนี้" }, statusCode: 403);

        var success = await ownerService.UpdateReviewReplyAsync(storeId, reviewId, dto.Reply);
        if (!success)
            return Results.BadRequest(new { message = "ไม่สามารถแก้ไขการตอบได้ (อาจยังไม่มีการตอบ หรือไม่พบรีวิว)" });

        return Results.Ok(new { message = "แก้ไขการตอบรีวิวสำเร็จ" });
    }

    private static async Task<IResult> DeleteReviewReply(
        Guid storeId,
        Guid reviewId,
        OwnerService ownerService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        if (user == null) return Results.Unauthorized();

        var ownership = await ownerService.VerifyOwnershipAsync(user.Id, storeId);
        if (ownership == null)
            return Results.Json(new { message = "คุณไม่มีสิทธิ์ลบการตอบรีวิวร้านนี้" }, statusCode: 403);

        var success = await ownerService.DeleteReviewReplyAsync(storeId, reviewId);
        if (!success)
            return Results.BadRequest(new { message = "ไม่สามารถลบการตอบได้ (อาจยังไม่มีการตอบ หรือไม่พบรีวิว)" });

        return Results.Ok(new { message = "ลบการตอบรีวิวสำเร็จ" });
    }

    // --- Helper: Extract Firebase user and get/create DB user ---

    private static async Task<User?> EnsureUserAsync(UserService userService, HttpContext context)
    {
        var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
            return null;

        var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "";
        var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;
        var photoUrl = context.User.FindFirst("picture")?.Value;
        var provider = context.User.FindFirst("firebase_provider")?.Value ?? "firebase";

        return await userService.GetOrCreateUserAsync(firebaseUid, email, displayName, photoUrl, provider);
    }
}
