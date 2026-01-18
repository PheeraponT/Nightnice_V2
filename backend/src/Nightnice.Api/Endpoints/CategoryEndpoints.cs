using Nightnice.Api.Data.Repositories;

namespace Nightnice.Api.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories")
            .WithTags("Categories")
            .WithOpenApi();

        group.MapGet("", GetCategories)
            .WithName("GetCategories")
            .WithSummary("Get all categories")
            .WithDescription("Returns all store categories with store counts.");

        group.MapGet("/{slug}", GetCategoryBySlug)
            .WithName("GetCategoryBySlug")
            .WithSummary("Get category details")
            .WithDescription("Returns details about a specific category.");

        // T072: Category detail endpoint for SEO landing pages
        group.MapGet("/{slug}/detail", GetCategoryDetailBySlug)
            .WithName("GetCategoryDetailBySlug")
            .WithSummary("Get category detail with province counts")
            .WithDescription("Returns category details with store counts per province for SEO landing pages.");
    }

    private static async Task<IResult> GetCategories(CategoryRepository repository)
    {
        var categories = await repository.GetAllWithStoreCountAsync();
        return Results.Ok(categories);
    }

    private static async Task<IResult> GetCategoryBySlug(CategoryRepository repository, string slug)
    {
        var category = await repository.GetBySlugAsync(slug);

        if (category == null)
            return Results.NotFound(new { message = "Category not found" });

        return Results.Ok(category);
    }

    // T072: Category detail for SEO landing pages
    private static async Task<IResult> GetCategoryDetailBySlug(CategoryRepository repository, string slug)
    {
        var category = await repository.GetDetailBySlugAsync(slug);

        if (category == null)
            return Results.NotFound(new { message = "Category not found" });

        return Results.Ok(category);
    }
}
