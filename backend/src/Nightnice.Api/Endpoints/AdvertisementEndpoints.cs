using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

// T099 & T100: Advertisement endpoints for targeted ads
public static class AdvertisementEndpoints
{
    public static void MapAdvertisementEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/ads")
            .WithTags("Advertisements")
            .WithOpenApi();

        // T099: Get targeted ads
        group.MapGet("", GetAds)
            .WithName("GetAds")
            .WithSummary("Get targeted advertisements")
            .WithDescription("Returns advertisements based on targeting parameters (province, category, type).");

        // T100: Track ad events
        group.MapPost("/track", TrackAdEvent)
            .WithName("TrackAdEvent")
            .WithSummary("Track ad impression or click")
            .WithDescription("Records an impression or click event for an advertisement.");
    }

    private static async Task<IResult> GetAds(
        AdService adService,
        [FromQuery] string? province = null,
        [FromQuery] string? category = null,
        [FromQuery] string? type = null,
        [FromQuery] int limit = 5)
    {
        var targeting = new AdTargetingParams(
            ProvinceSlug: province,
            CategorySlug: category,
            AdType: type,
            Limit: limit
        );

        var ads = await adService.GetTargetedAdsAsync(targeting);
        return Results.Ok(ads);
    }

    private static async Task<IResult> TrackAdEvent(
        AdService adService,
        AdTrackingDto tracking)
    {
        var response = await adService.TrackEventAsync(tracking);

        if (response.Success)
            return Results.Ok(response);

        return Results.BadRequest(response);
    }
}
