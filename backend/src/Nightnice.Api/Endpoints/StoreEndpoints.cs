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

        // T082: Nearby stores endpoint
        group.MapGet("/{slug}/nearby", GetNearbyStores)
            .WithName("GetNearbyStores")
            .WithSummary("Get nearby stores")
            .WithDescription("Returns stores within specified radius of the given store.");
    }

    private static async Task<IResult> GetStores(
        StoreService storeService,
        [FromQuery] string? q = null,
        [FromQuery] string? province = null,
        [FromQuery] string? category = null,
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
}
