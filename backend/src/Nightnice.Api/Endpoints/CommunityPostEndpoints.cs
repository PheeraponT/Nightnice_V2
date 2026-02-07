using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;
using System.Security.Claims;

namespace Nightnice.Api.Endpoints;

public static class CommunityPostEndpoints
{
    public static void MapCommunityPostEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/community-posts")
            .WithTags("Community Posts")
            .WithOpenApi();

        group.MapGet("", GetFeed)
            .WithName("GetCommunityPosts")
            .WithSummary("ดึงรายการ community posts")
            .AllowAnonymous();

        var protectedGroup = group.RequireAuthorization();

        protectedGroup.MapPost("", CreatePost)
            .WithName("CreateCommunityPost")
            .WithSummary("สร้าง community post ใหม่");

        protectedGroup.MapPost("/upload-image", UploadPostImage)
            .WithName("UploadCommunityPostImage")
            .DisableAntiforgery()
            .WithSummary("อัปโหลดรูปสำหรับ community post");

        protectedGroup.MapPut("/{postId:guid}", UpdatePost)
            .WithName("UpdateCommunityPost")
            .WithSummary("แก้ไข community post ของตัวเอง");

        protectedGroup.MapDelete("/{postId:guid}", DeletePost)
            .WithName("DeleteCommunityPost")
            .WithSummary("ลบ community post ของตัวเอง");

        protectedGroup.MapGet("/me", GetMyPosts)
            .WithName("GetMyCommunityPosts")
            .WithSummary("ดูโพสต์ที่ตัวเองเขียน");
    }

    private static async Task<IResult> GetFeed(
        [AsParameters] CommunityPostFeedParams feedParams,
        CommunityPostService postService)
    {
        var result = await postService.GetFeedAsync(feedParams);
        return Results.Ok(result);
    }

    private static async Task<IResult> CreatePost(
        [FromBody] CommunityPostCreateDto createDto,
        CommunityPostService postService,
        UserService userService,
        HttpContext context,
        IValidator<CommunityPostCreateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(createDto);
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
        var provider = context.User.FindFirst("firebase_sign_in_provider")?.Value;

        var user = await userService.GetOrCreateUserAsync(firebaseUid, email, displayName, photoUrl, provider);

        try
        {
            var created = await postService.CreateAsync(user.Id, createDto);
            return Results.Created($"/api/community-posts/{created.Id}", created);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> UploadPostImage(
        IFormFile file,
        ImageService imageService,
        HttpContext context)
    {
        var firebaseUid = context.User.FindFirst("firebase_uid")?.Value;
        if (string.IsNullOrEmpty(firebaseUid))
        {
            return Results.Unauthorized();
        }

        if (file.Length == 0)
        {
            return Results.BadRequest(new { message = "ไม่มีไฟล์" });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(new { message = "รองรับเฉพาะ JPEG, PNG, WebP" });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return Results.BadRequest(new { message = "ไฟล์ต้องมีขนาดไม่เกิน 5MB" });
        }

        var imageUrl = await imageService.UploadImageAsync(file, "community-posts");
        return Results.Ok(new { imageUrl });
    }

    private static async Task<IResult> UpdatePost(
        Guid postId,
        [FromBody] CommunityPostUpdateDto updateDto,
        CommunityPostService postService,
        UserService userService,
        HttpContext context,
        IValidator<CommunityPostUpdateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(updateDto);
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

        var user = await userService.GetByFirebaseUidAsync(firebaseUid);
        if (user == null)
        {
            return Results.Unauthorized();
        }

        try
        {
            var updated = await postService.UpdateAsync(user.Id, postId, updateDto);
            return Results.Ok(updated);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    private static async Task<IResult> DeletePost(
        Guid postId,
        CommunityPostService postService,
        UserService userService,
        HttpContext context)
    {
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

        try
        {
            var result = await postService.DeleteAsync(user.Id, postId);
            if (!result)
            {
                return Results.NotFound(new { message = "ไม่พบโพสต์" });
            }
            return Results.Ok(new { message = "ลบโพสต์เรียบร้อยแล้ว" });
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
    }

    private static async Task<IResult> GetMyPosts(
        [FromQuery] int limit,
        CommunityPostService postService,
        UserService userService,
        HttpContext context)
    {
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

        var normalizedLimit = limit == 0 ? 8 : limit;
        var posts = await postService.GetUserPostsAsync(user.Id, normalizedLimit);
        return Results.Ok(posts);
    }
}
