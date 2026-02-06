using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/user")
            .WithTags("User")
            .WithOpenApi()
            .RequireAuthorization();

        group.MapGet("/account", GetAccount)
            .WithName("GetUserAccount")
            .WithSummary("Get account profile, preferences, and favorite IDs");

        group.MapPut("/preferences", UpdatePreferences)
            .WithName("UpdateUserPreferences")
            .WithSummary("Update privacy and notification preferences");

        group.MapGet("/favorites", GetFavorites)
            .WithName("GetUserFavorites")
            .WithSummary("Get favorite store IDs");

        group.MapPost("/favorites", AddFavorite)
            .WithName("AddFavoriteStore")
            .WithSummary("Add store to favorites");

        group.MapDelete("/favorites/{storeId:guid}", RemoveFavorite)
            .WithName("RemoveFavoriteStore")
            .WithSummary("Remove store from favorites");

        group.MapDelete("/favorites", ClearFavorites)
            .WithName("ClearFavoriteStores")
            .WithSummary("Remove all favorites");

        group.MapGet("/account/export", ExportAccount)
            .WithName("ExportUserData")
            .WithSummary("Export account data and favorites as JSON");
    }

    private static async Task<IResult> GetAccount(UserService userService, HttpContext context)
    {
        var (firebaseUid, _) = await EnsureUserAsync(userService, context);
        var account = await userService.GetAccountAsync(firebaseUid);
        return account is null ? Results.NotFound(new { message = "ไม่พบบัญชี" }) : Results.Ok(account);
    }

    private static async Task<IResult> UpdatePreferences(
        [FromBody] UserPreferencesDto preferences,
        UserService userService,
        HttpContext context)
    {
        var (_, user) = await EnsureUserAsync(userService, context);
        await userService.UpdatePreferencesAsync(user.Id, preferences);
        return Results.NoContent();
    }

    private static async Task<IResult> GetFavorites(UserService userService, HttpContext context)
    {
        var (_, user) = await EnsureUserAsync(userService, context);
        var favorites = await userService.GetFavoritesAsync(user.Id);
        return Results.Ok(favorites);
    }

    private static async Task<IResult> AddFavorite(
        [FromBody] UserFavoriteRequestDto request,
        UserService userService,
        StoreService storeService,
        HttpContext context)
    {
        if (request.StoreId == Guid.Empty)
        {
            return Results.BadRequest(new { message = "กรุณาระบุรหัสร้าน" });
        }

        if (!await storeService.StoreExistsAsync(request.StoreId))
        {
            return Results.NotFound(new { message = "ไม่พบบันทึกร้าน" });
        }

        var (_, user) = await EnsureUserAsync(userService, context);
        await userService.AddFavoriteAsync(user.Id, request.StoreId);
        var favorites = await userService.GetFavoritesAsync(user.Id);
        return Results.Ok(favorites);
    }

    private static async Task<IResult> RemoveFavorite(
        Guid storeId,
        UserService userService,
        HttpContext context)
    {
        if (storeId == Guid.Empty)
        {
            return Results.BadRequest(new { message = "กรุณาระบุรหัสร้าน" });
        }

        var (_, user) = await EnsureUserAsync(userService, context);
        await userService.RemoveFavoriteAsync(user.Id, storeId);
        var favorites = await userService.GetFavoritesAsync(user.Id);
        return Results.Ok(favorites);
    }

    private static async Task<IResult> ClearFavorites(UserService userService, HttpContext context)
    {
        var (_, user) = await EnsureUserAsync(userService, context);
        await userService.ClearFavoritesAsync(user.Id);
        return Results.NoContent();
    }

    private static async Task<IResult> ExportAccount(UserService userService, HttpContext context)
    {
        var (_, user) = await EnsureUserAsync(userService, context);
        var export = await userService.ExportAccountDataAsync(user.Id);
        return Results.Ok(export);
    }

    private static async Task<(string FirebaseUid, User User)> EnsureUserAsync(UserService userService, HttpContext context)
    {
        var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
        {
            throw new UnauthorizedAccessException("Firebase token missing");
        }

        var email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "";
        var displayName = context.User.FindFirst(ClaimTypes.Name)?.Value;
        var photoUrl = context.User.FindFirst("picture")?.Value;
        var provider = context.User.FindFirst("firebase_provider")?.Value ?? "firebase";

        var user = await userService.GetOrCreateUserAsync(firebaseUid, email, displayName, photoUrl, provider);
        return (firebaseUid, user);
    }
}
