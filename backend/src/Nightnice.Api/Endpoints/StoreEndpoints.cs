using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class StoreEndpoints
{
    public static void MapStoreEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/stores")
            .WithTags("Stores")
            .WithOpenApi();

        group.MapGet("", GetStores)
            .WithName("GetStores")
            .WithSummary("Search and filter stores")
            .WithDescription("Returns a paginated list of stores with optional filtering by province, category, price range, and search query.");

        group.MapGet("/featured", GetFeaturedStores)
            .WithName("GetFeaturedStores")
            .WithSummary("Get featured stores")
            .WithDescription("Returns a list of featured stores for the homepage.");

        // Map stores endpoint - returns stores with coordinates for map display
        // Must be before /{slug} to avoid being caught by the slug route
        group.MapGet("/map", GetMapStores)
            .WithName("GetMapStores")
            .WithSummary("Get stores for map display")
            .WithDescription("Returns stores with coordinates for displaying on a map.");

        group.MapGet("/{slug}", GetStoreBySlug)
            .WithName("GetStoreBySlug")
            .WithSummary("Get store details")
            .WithDescription("Returns detailed information about a specific store by its slug.");

        group.MapGet("/{storeId:guid}/mood-insight", GetStoreMoodInsight)
            .WithName("GetStoreMoodInsight")
            .WithSummary("Get aggregated Mood & Vibe insight for a store")
            .WithDescription("Returns community-powered Mood & Vibe data if available.");

        // T082: Nearby stores endpoint
        group.MapGet("/{slug}/nearby", GetNearbyStores)
            .WithName("GetNearbyStores")
            .WithSummary("Get nearby stores")
            .WithDescription("Returns stores within specified radius of the given store.");

        // Get stores by IDs (for favorites page)
        group.MapPost("/by-ids", GetStoresByIds)
            .WithName("GetStoresByIds")
            .WithSummary("Get stores by IDs")
            .WithDescription("Returns stores matching the provided list of IDs.");

        // Authenticated store utilities
        var protectedGroup = group.MapGroup(string.Empty).RequireAuthorization();

        protectedGroup.MapPost("/{storeId:guid}/mood-feedback", SubmitMoodFeedback)
            .WithName("SubmitMoodFeedback")
            .WithSummary("Submit quick Mood & Vibe feedback for a store.")
            .WithDescription("Allows verified visitors to contribute Mood & Vibe scores without writing a full review.");
    }

    private static async Task<IResult> GetStores(
        StoreService storeService,
        [FromQuery] string? q = null,
        [FromQuery] string? province = null,
        [FromQuery] string? category = null,
        [FromQuery] string? mood = null,
        [FromQuery] short? minPrice = null,
        [FromQuery] short? maxPrice = null,
        [FromQuery] bool? featured = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] decimal? lat = null,
        [FromQuery] decimal? lng = null,
        [FromQuery] bool sortByDistance = false)
    {
        var searchParams = new StoreSearchParams(
            Query: q,
            ProvinceSlug: province,
            CategorySlug: category,
            Mood: mood,
            MinPrice: minPrice,
            MaxPrice: maxPrice,
            IsFeatured: featured,
            Page: page,
            PageSize: pageSize,
            UserLatitude: lat,
            UserLongitude: lng,
            SortByDistance: sortByDistance
        );

        var result = await storeService.SearchStoresAsync(searchParams);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetFeaturedStores(
        StoreService storeService,
        [FromQuery] int count = 6)
    {
        var stores = await storeService.GetFeaturedStoresAsync(count);
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetStoreBySlug(
        StoreService storeService,
        string slug)
    {
        var store = await storeService.GetStoreBySlugAsync(slug);

        if (store == null)
            return Results.NotFound(new { message = "Store not found" });

        return Results.Ok(store);
    }

    // T082: Nearby stores endpoint handler
    private static async Task<IResult> GetNearbyStores(
        StoreService storeService,
        string slug,
        [FromQuery] double radius = 5.0,
        [FromQuery] int count = 6)
    {
        var stores = await storeService.GetNearbyStoresAsync(slug, radius, count);
        return Results.Ok(stores);
    }

    // Map stores endpoint handler
    private static async Task<IResult> GetMapStores(
        StoreService storeService,
        [FromQuery] string? province = null,
        [FromQuery] string? category = null,
        [FromQuery] int maxCount = 1000,
        [FromQuery] decimal? lat = null,
        [FromQuery] decimal? lng = null,
        [FromQuery] bool sortByDistance = false)
    {
        var stores = await storeService.GetMapStoresAsync(province, category, maxCount, lat, lng, sortByDistance);
        return Results.Ok(stores);
    }

    // Get stores by IDs (for favorites)
    private static async Task<IResult> GetStoresByIds(
        StoreService storeService,
        [FromBody] StoresByIdsRequest request)
    {
        if (request.Ids == null || request.Ids.Count == 0)
            return Results.Ok(Array.Empty<StoreListDto>());

        // Limit to prevent abuse
        var ids = request.Ids.Take(100).ToList();
        var stores = await storeService.GetStoresByIdsAsync(ids);
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetStoreMoodInsight(
        StoreService storeService,
        Guid storeId)
    {
        var insight = await storeService.GetMoodInsightAsync(storeId);
        return Results.Ok(insight);
    }

    private static async Task<IResult> SubmitMoodFeedback(
        Guid storeId,
        [FromBody] MoodFeedbackInputDto moodDto,
        ReviewService reviewService,
        UserService userService,
        HttpContext context,
        IValidator<MoodFeedbackInputDto> validator)
    {
        var validationResult = await validator.ValidateAsync(moodDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new
            {
                errors = validationResult.Errors.Select(e => e.ErrorMessage)
            });
        }

        var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
        {
            return Results.Unauthorized();
        }

        var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;
        var photoUrl = context.User.FindFirst("picture")?.Value;
        var user = await userService.GetOrCreateUserAsync(firebaseUid, email, displayName, photoUrl, "google.com");

        await reviewService.SubmitMoodFeedbackAsync(storeId, user.Id, moodDto);

        return Results.Ok(new
        {
            message = "บันทึก Mood & Vibe ของคุณแล้ว ขอบคุณที่ช่วยให้ข้อมูลแม่นยำขึ้น!"
        });
    }
}

public record StoresByIdsRequest(List<Guid> Ids);
