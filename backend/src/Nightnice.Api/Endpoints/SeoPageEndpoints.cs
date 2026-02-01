using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class SeoPageEndpoints
{
    public static void MapSeoPageEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/seo")
            .WithTags("SEO Pages")
            .WithOpenApi();

        // View tracking
        group.MapPost("/track-view", TrackStoreView)
            .WithName("TrackStoreView")
            .WithSummary("Track a store page view")
            .WithDescription("Records a page view for popularity tracking. Deduplicates views within 1 hour per session.");

        // Popular stores
        group.MapGet("/popular", GetPopularStores)
            .WithName("GetPopularStores")
            .WithSummary("Get popular stores nationwide")
            .WithDescription("Returns stores ranked by view count.");

        group.MapGet("/popular/{provinceSlug}", GetPopularStoresByProvince)
            .WithName("GetPopularStoresByProvince")
            .WithSummary("Get popular stores in a province")
            .WithDescription("Returns popular stores in a specific province.");

        group.MapGet("/popular-meta", GetPopularPageMeta)
            .WithName("GetPopularPageMeta")
            .WithSummary("Get popular page metadata")
            .WithDescription("Returns SEO metadata for the popular stores page.");

        group.MapGet("/popular-meta/{provinceSlug}", GetPopularPageMetaByProvince)
            .WithName("GetPopularPageMetaByProvince")
            .WithSummary("Get popular page metadata by province")
            .WithDescription("Returns SEO metadata for the popular stores page in a province.");

        // Late-night stores
        group.MapGet("/late-night", GetLateNightStores)
            .WithName("GetLateNightStores")
            .WithSummary("Get late-night stores nationwide")
            .WithDescription("Returns stores that close after midnight (00:00-06:00).");

        group.MapGet("/late-night/{provinceSlug}", GetLateNightStoresByProvince)
            .WithName("GetLateNightStoresByProvince")
            .WithSummary("Get late-night stores in a province")
            .WithDescription("Returns late-night stores in a specific province.");

        group.MapGet("/late-night-meta", GetLateNightPageMeta)
            .WithName("GetLateNightPageMeta")
            .WithSummary("Get late-night page metadata")
            .WithDescription("Returns SEO metadata for the late-night stores page.");

        group.MapGet("/late-night-meta/{provinceSlug}", GetLateNightPageMetaByProvince)
            .WithName("GetLateNightPageMetaByProvince")
            .WithSummary("Get late-night page metadata by province")
            .WithDescription("Returns SEO metadata for the late-night stores page in a province.");

        // Themed collections
        group.MapGet("/themes", GetAvailableThemes)
            .WithName("GetAvailableThemes")
            .WithSummary("Get available themes")
            .WithDescription("Returns list of available theme collections with store counts.");

        group.MapGet("/theme/{themeSlug}", GetThemedStores)
            .WithName("GetThemedStores")
            .WithSummary("Get themed stores")
            .WithDescription("Returns stores matching a theme (e.g., live-music, rooftop-bar).");

        group.MapGet("/theme/{themeSlug}/{provinceSlug}", GetThemedStoresByProvince)
            .WithName("GetThemedStoresByProvince")
            .WithSummary("Get themed stores in a province")
            .WithDescription("Returns themed stores in a specific province.");
    }

    #region View Tracking

    private static async Task<IResult> TrackStoreView(
        SeoService seoService,
        [FromBody] StoreViewTrackingDto request,
        HttpContext context)
    {
        // Generate session hash from IP + User-Agent for deduplication
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "";
        var ua = context.Request.Headers.UserAgent.ToString();
        var sessionHash = ComputeHash($"{ip}:{ua}");

        var success = await seoService.TrackViewAsync(request.StoreId, request.Referrer, sessionHash);
        return Results.Ok(new StoreViewTrackingResponse(success, success ? "View tracked" : "Failed to track view"));
    }

    private static string ComputeHash(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash)[..32];
    }

    #endregion

    #region Popular Stores

    private static async Task<IResult> GetPopularStores(
        SeoService seoService,
        [FromQuery] int count = 24)
    {
        var stores = await seoService.GetPopularStoresAsync(null, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetPopularStoresByProvince(
        SeoService seoService,
        string provinceSlug,
        [FromQuery] int count = 24)
    {
        var stores = await seoService.GetPopularStoresAsync(provinceSlug, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetPopularPageMeta(SeoService seoService)
    {
        var meta = await seoService.GetPopularPageMetaAsync();
        return Results.Ok(meta);
    }

    private static async Task<IResult> GetPopularPageMetaByProvince(
        SeoService seoService,
        string provinceSlug)
    {
        var meta = await seoService.GetPopularPageMetaAsync(provinceSlug);
        return Results.Ok(meta);
    }

    #endregion

    #region Late-Night Stores

    private static async Task<IResult> GetLateNightStores(
        SeoService seoService,
        [FromQuery] int count = 24)
    {
        var stores = await seoService.GetLateNightStoresAsync(null, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetLateNightStoresByProvince(
        SeoService seoService,
        string provinceSlug,
        [FromQuery] int count = 24)
    {
        var stores = await seoService.GetLateNightStoresAsync(provinceSlug, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetLateNightPageMeta(SeoService seoService)
    {
        var meta = await seoService.GetLateNightPageMetaAsync();
        return Results.Ok(meta);
    }

    private static async Task<IResult> GetLateNightPageMetaByProvince(
        SeoService seoService,
        string provinceSlug)
    {
        var meta = await seoService.GetLateNightPageMetaAsync(provinceSlug);
        return Results.Ok(meta);
    }

    #endregion

    #region Themed Stores

    private static async Task<IResult> GetAvailableThemes(SeoService seoService)
    {
        var themes = await seoService.GetAvailableThemesAsync();
        return Results.Ok(themes);
    }

    private static async Task<IResult> GetThemedStores(
        SeoService seoService,
        string themeSlug,
        [FromQuery] int count = 24)
    {
        var theme = seoService.GetThemeConfig(themeSlug);
        if (theme == null)
        {
            return Results.NotFound(new { error = "Theme not found", themeSlug });
        }

        var stores = await seoService.GetThemedStoresAsync(themeSlug, null, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    private static async Task<IResult> GetThemedStoresByProvince(
        SeoService seoService,
        string themeSlug,
        string provinceSlug,
        [FromQuery] int count = 24)
    {
        var theme = seoService.GetThemeConfig(themeSlug);
        if (theme == null)
        {
            return Results.NotFound(new { error = "Theme not found", themeSlug });
        }

        var stores = await seoService.GetThemedStoresAsync(themeSlug, provinceSlug, Math.Clamp(count, 1, 100));
        return Results.Ok(stores);
    }

    #endregion
}
