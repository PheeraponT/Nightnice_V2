using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class EntityModerationEndpoints
{
    public static void MapEntityModerationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/moderation")
            .WithTags("EntityModeration")
            .RequireAuthorization();

        group.MapPost("/claims", SubmitClaim)
            .WithName("SubmitEntityClaim")
            .WithSummary("Submit an ownership claim for a store or event");

        group.MapPost("/updates", SubmitUpdateRequest)
            .WithName("SubmitEntityUpdate")
            .WithSummary("Submit quick update information for a store or event");

        group.MapPost("/proposals", SubmitProposal)
            .WithName("SubmitEntityProposal")
            .WithSummary("Propose a brand new store or event for verification");
    }

    private static async Task<IResult> SubmitProposal(
        [FromBody] EntityProposalRequestDto request,
        EntityModerationService moderationService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        var payloadJson = JsonSerializer.Serialize(request.Fields ?? new Dictionary<string, string>());
        var proposal = await moderationService.SubmitProposalAsync(
            request.EntityType,
            user.Id,
            request.Name,
            payloadJson,
            request.ReferenceUrl);

        return Results.Ok(new
        {
            proposal.Id,
            proposal.Status,
            proposal.CreatedAt
        });
    }

    private static async Task<IResult> SubmitClaim(
        [FromBody] EntityClaimRequestDto request,
        EntityModerationService moderationService,
        StoreService storeService,
        EventService eventService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        var entityId = await ResolveEntityIdAsync(request.EntityType, request.EntitySlug, storeService, eventService);
        if (entityId == null)
        {
            return Results.NotFound(new { message = "ไม่พบข้อมูลที่ต้องการ" });
        }

        var claim = await moderationService.SubmitClaimAsync(
            request.EntityType,
            entityId.Value,
            user.Id,
            request.EvidenceUrl,
            request.Notes);

        return Results.Ok(new
        {
            claim.Id,
            claim.Status,
            claim.CreatedAt
        });
    }

    private static async Task<IResult> SubmitUpdateRequest(
        [FromBody] EntityUpdateRequestDto request,
        EntityModerationService moderationService,
        StoreService storeService,
        EventService eventService,
        UserService userService,
        HttpContext context)
    {
        var user = await EnsureUserAsync(userService, context);
        var entityId = await ResolveEntityIdAsync(request.EntityType, request.EntitySlug, storeService, eventService);
        if (entityId == null)
        {
            return Results.NotFound(new { message = "ไม่พบข้อมูลที่ต้องการ" });
        }

        var payloadJson = JsonSerializer.Serialize(request.Fields ?? new Dictionary<string, string>());

        var updateRequest = await moderationService.SubmitUpdateRequestAsync(
            request.EntityType,
            entityId.Value,
            user.Id,
            payloadJson,
            request.ProofMediaUrl,
            request.ExternalProofUrl);

        return Results.Ok(new
        {
            updateRequest.Id,
            updateRequest.Status,
            updateRequest.CreatedAt
        });
    }

    private static async Task<Guid?> ResolveEntityIdAsync(
        ManagedEntityType entityType,
        string slug,
        StoreService storeService,
        EventService eventService)
    {
        return entityType switch
        {
            ManagedEntityType.Store => await storeService.ResolveStoreIdBySlugAsync(slug),
            ManagedEntityType.Event => await eventService.ResolveEventIdBySlugAsync(slug),
            _ => null
        };
    }

    private static async Task<User> EnsureUserAsync(UserService userService, HttpContext context)
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

        return await userService.GetOrCreateUserAsync(firebaseUid, email, displayName, photoUrl, provider);
    }
}
