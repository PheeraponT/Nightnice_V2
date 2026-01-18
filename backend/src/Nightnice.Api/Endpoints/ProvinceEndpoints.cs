using Nightnice.Api.Data.Repositories;

namespace Nightnice.Api.Endpoints;

public static class ProvinceEndpoints
{
    public static void MapProvinceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/provinces")
            .WithTags("Provinces")
            .WithOpenApi();

        group.MapGet("", GetProvinces)
            .WithName("GetProvinces")
            .WithSummary("Get all provinces")
            .WithDescription("Returns all Thai provinces with store counts.");

        group.MapGet("/grouped", GetProvincesGroupedByRegion)
            .WithName("GetProvincesGroupedByRegion")
            .WithSummary("Get provinces grouped by region")
            .WithDescription("Returns all provinces organized by region for navigation menus.");

        group.MapGet("/{slug}", GetProvinceBySlug)
            .WithName("GetProvinceBySlug")
            .WithSummary("Get province details")
            .WithDescription("Returns details about a specific province.");

        // T071: Province detail endpoint for SEO landing pages
        group.MapGet("/{slug}/detail", GetProvinceDetailBySlug)
            .WithName("GetProvinceDetailBySlug")
            .WithSummary("Get province detail with category counts")
            .WithDescription("Returns province details with store counts per category for SEO landing pages.");

        // T073: Regions endpoint
        var regionsGroup = app.MapGroup("/api/regions")
            .WithTags("Regions")
            .WithOpenApi();

        regionsGroup.MapGet("", GetRegions)
            .WithName("GetRegions")
            .WithSummary("Get all regions")
            .WithDescription("Returns all Thai regions with province and store counts.");
    }

    private static async Task<IResult> GetProvinces(ProvinceRepository repository)
    {
        var provinces = await repository.GetAllWithStoreCountAsync();
        return Results.Ok(provinces);
    }

    private static async Task<IResult> GetProvincesGroupedByRegion(ProvinceRepository repository)
    {
        var regions = await repository.GetGroupedByRegionAsync();
        return Results.Ok(regions);
    }

    private static async Task<IResult> GetProvinceBySlug(ProvinceRepository repository, string slug)
    {
        var province = await repository.GetBySlugAsync(slug);

        if (province == null)
            return Results.NotFound(new { message = "Province not found" });

        return Results.Ok(province);
    }

    // T071: Province detail for SEO landing pages
    private static async Task<IResult> GetProvinceDetailBySlug(ProvinceRepository repository, string slug)
    {
        var province = await repository.GetDetailBySlugAsync(slug);

        if (province == null)
            return Results.NotFound(new { message = "Province not found" });

        return Results.Ok(province);
    }

    // T073: Get all regions
    private static async Task<IResult> GetRegions(ProvinceRepository repository)
    {
        var regions = await repository.GetAllRegionsAsync();
        return Results.Ok(regions);
    }
}
