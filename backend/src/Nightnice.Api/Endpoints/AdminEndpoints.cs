using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Data;
using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

// T113: Admin endpoints for authentication and store management
public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin")
            .WithTags("Admin");

        // Auth endpoints (public)
        group.MapPost("/login", Login)
            .WithName("AdminLogin")
            .AllowAnonymous()
            .WithOpenApi();

        group.MapPost("/refresh", RefreshToken)
            .WithName("AdminRefreshToken")
            .AllowAnonymous()
            .WithOpenApi();

        group.MapPost("/logout", Logout)
            .WithName("AdminLogout")
            .AllowAnonymous()
            .WithOpenApi();

        // Protected endpoints
        var protectedGroup = group.RequireAuthorization();

        protectedGroup.MapGet("/me", GetCurrentUser)
            .WithName("AdminGetCurrentUser")
            .WithOpenApi();

        protectedGroup.MapGet("/dashboard", GetDashboardStats)
            .WithName("AdminGetDashboardStats")
            .WithOpenApi();

        // Store management (T116)
        protectedGroup.MapGet("/stores", GetStores)
            .WithName("AdminGetStores")
            .WithOpenApi();

        protectedGroup.MapGet("/stores/dropdown", GetStoresDropdown)
            .WithName("AdminGetStoresDropdown")
            .WithOpenApi();

        protectedGroup.MapGet("/stores/{id:guid}", GetStore)
            .WithName("AdminGetStore")
            .WithOpenApi();

        protectedGroup.MapPost("/stores", CreateStore)
            .WithName("AdminCreateStore")
            .WithOpenApi();

        protectedGroup.MapPut("/stores/{id:guid}", UpdateStore)
            .WithName("AdminUpdateStore")
            .WithOpenApi();

        protectedGroup.MapDelete("/stores/{id:guid}", DeleteStore)
            .WithName("AdminDeleteStore")
            .WithOpenApi();

        // Store images (T117)
        protectedGroup.MapPost("/stores/{id:guid}/images", UploadStoreImage)
            .WithName("AdminUploadStoreImage")
            .DisableAntiforgery()
            .WithOpenApi();

        protectedGroup.MapDelete("/stores/{storeId:guid}/images/{imageId:guid}", DeleteStoreImage)
            .WithName("AdminDeleteStoreImage")
            .WithOpenApi();

        // Store logo / banner
        protectedGroup.MapPost("/stores/{id:guid}/logo", UploadStoreLogo)
            .WithName("AdminUploadStoreLogo")
            .DisableAntiforgery()
            .WithOpenApi();

        protectedGroup.MapDelete("/stores/{id:guid}/logo", DeleteStoreLogo)
            .WithName("AdminDeleteStoreLogo")
            .WithOpenApi();

        protectedGroup.MapPost("/stores/{id:guid}/banner", UploadStoreBanner)
            .WithName("AdminUploadStoreBanner")
            .DisableAntiforgery()
            .WithOpenApi();

        protectedGroup.MapDelete("/stores/{id:guid}/banner", DeleteStoreBanner)
            .WithName("AdminDeleteStoreBanner")
            .WithOpenApi();

        // Province management (T130)
        protectedGroup.MapGet("/provinces", GetProvinces)
            .WithName("AdminGetProvinces")
            .WithOpenApi();

        protectedGroup.MapGet("/provinces/{id:guid}", GetProvince)
            .WithName("AdminGetProvince")
            .WithOpenApi();

        protectedGroup.MapPut("/provinces/{id:guid}", UpdateProvince)
            .WithName("AdminUpdateProvince")
            .WithOpenApi();

        // Category management (T131)
        protectedGroup.MapGet("/categories", GetCategories)
            .WithName("AdminGetCategories")
            .WithOpenApi();

        protectedGroup.MapGet("/categories/{id:guid}", GetCategory)
            .WithName("AdminGetCategory")
            .WithOpenApi();

        protectedGroup.MapPost("/categories", CreateCategory)
            .WithName("AdminCreateCategory")
            .WithOpenApi();

        protectedGroup.MapPut("/categories/{id:guid}", UpdateCategory)
            .WithName("AdminUpdateCategory")
            .WithOpenApi();

        protectedGroup.MapDelete("/categories/{id:guid}", DeleteCategory)
            .WithName("AdminDeleteCategory")
            .WithOpenApi();

        // Ad management (T140-T142)
        protectedGroup.MapGet("/ads", GetAds)
            .WithName("AdminGetAds")
            .WithOpenApi();

        protectedGroup.MapGet("/ads/{id:guid}", GetAd)
            .WithName("AdminGetAd")
            .WithOpenApi();

        protectedGroup.MapPost("/ads", CreateAd)
            .WithName("AdminCreateAd")
            .WithOpenApi();

        protectedGroup.MapPut("/ads/{id:guid}", UpdateAd)
            .WithName("AdminUpdateAd")
            .WithOpenApi();

        protectedGroup.MapDelete("/ads/{id:guid}", DeleteAd)
            .WithName("AdminDeleteAd")
            .WithOpenApi();

        // T141: Ad metrics
        protectedGroup.MapGet("/ads/{id:guid}/metrics", GetAdMetrics)
            .WithName("AdminGetAdMetrics")
            .WithOpenApi();

        // T142: Ad image upload
        protectedGroup.MapPost("/ads/{id:guid}/image", UploadAdImage)
            .WithName("AdminUploadAdImage")
            .DisableAntiforgery()
            .WithOpenApi();

        // Contact management (T143)
        protectedGroup.MapGet("/contacts", GetContacts)
            .WithName("AdminGetContacts")
            .WithOpenApi();

        protectedGroup.MapGet("/contacts/{id:guid}", GetContact)
            .WithName("AdminGetContact")
            .WithOpenApi();

        protectedGroup.MapPut("/contacts/{id:guid}/read", MarkContactAsRead)
            .WithName("AdminMarkContactAsRead")
            .WithOpenApi();

        protectedGroup.MapDelete("/contacts/{id:guid}", DeleteContact)
            .WithName("AdminDeleteContact")
            .WithOpenApi();

        protectedGroup.MapGet("/contacts/unread-count", GetUnreadContactCount)
            .WithName("AdminGetUnreadContactCount")
            .WithOpenApi();

        // Moderation management
        protectedGroup.MapGet("/moderation/claims", GetModerationClaims)
            .WithName("AdminGetModerationClaims")
            .WithOpenApi();

        protectedGroup.MapPost("/moderation/claims/{id:guid}/decision", DecideClaim)
            .WithName("AdminDecideClaim")
            .WithOpenApi();

        protectedGroup.MapGet("/moderation/updates", GetModerationUpdates)
            .WithName("AdminGetModerationUpdates")
            .WithOpenApi();

        protectedGroup.MapPost("/moderation/updates/{id:guid}/decision", DecideUpdateRequest)
            .WithName("AdminDecideUpdateRequest")
            .WithOpenApi();

        protectedGroup.MapGet("/moderation/proposals", GetModerationProposals)
            .WithName("AdminGetModerationProposals")
            .WithOpenApi();

        protectedGroup.MapPost("/moderation/proposals/{id:guid}/decision", DecideProposal)
            .WithName("AdminDecideProposal")
            .WithOpenApi();

        // Event management
        protectedGroup.MapGet("/events", GetEvents)
            .WithName("AdminGetEvents")
            .WithOpenApi();

        protectedGroup.MapGet("/events/{id:guid}", GetEvent)
            .WithName("AdminGetEvent")
            .WithOpenApi();

        protectedGroup.MapPost("/events", CreateEvent)
            .WithName("AdminCreateEvent")
            .WithOpenApi();

        protectedGroup.MapPut("/events/{id:guid}", UpdateEvent)
            .WithName("AdminUpdateEvent")
            .WithOpenApi();

        protectedGroup.MapDelete("/events/{id:guid}", DeleteEvent)
            .WithName("AdminDeleteEvent")
            .WithOpenApi();

        protectedGroup.MapPost("/events/{id:guid}/image", UploadEventImage)
            .WithName("AdminUploadEventImage")
            .DisableAntiforgery()
            .WithOpenApi();
    }

    // T113: Login endpoint
    private static async Task<IResult> Login(
        [FromBody] LoginDto? loginDto,
        AdminAuthService authService,
        IValidator<LoginDto> validator,
        ILogger<Program> logger)
    {
        logger.LogInformation("=== LOGIN ENDPOINT HIT ===");
        Console.WriteLine("=== LOGIN ENDPOINT HIT ===");

        if (loginDto == null)
        {
            logger.LogWarning("Login request body is null");
            return Results.BadRequest(new { error = "Request body is required" });
        }

        logger.LogInformation("Username: {Username}", loginDto.Username);
        Console.WriteLine($"Username: {loginDto.Username}");

        var validationResult = await validator.ValidateAsync(loginDto);
        if (!validationResult.IsValid)
        {
            logger.LogWarning("Validation failed: {Errors}", string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await authService.LoginAsync(loginDto);
        if (result == null)
        {
            logger.LogWarning("Login failed for user: {Username}", loginDto.Username);
            return Results.Unauthorized();
        }

        logger.LogInformation("Login successful for user: {Username}", loginDto.Username);
        return Results.Ok(result);
    }

    // T113: Refresh token endpoint
    private static async Task<IResult> RefreshToken(
        [FromBody] RefreshTokenDto refreshDto,
        AdminAuthService authService)
    {
        var result = await authService.RefreshTokenAsync(refreshDto);
        if (result == null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(result);
    }

    // T113: Logout endpoint
    private static IResult Logout(
        [FromBody] RefreshTokenDto refreshDto,
        AdminAuthService authService)
    {
        authService.Logout(refreshDto.RefreshToken);
        return Results.Ok(new { message = "Logged out successfully" });
    }

    // Get current user info
    private static async Task<IResult> GetCurrentUser(
        ClaimsPrincipal user,
        AdminAuthService authService)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var adminUser = await authService.GetCurrentUserAsync(userId);
        if (adminUser == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new AdminUserDto(adminUser.Id, adminUser.Username, adminUser.Email));
    }

    // T116: Get all stores for admin
    private static async Task<IResult> GetStores(
        [AsParameters] AdminStoreSearchParams searchParams,
        StoreService storeService)
    {
        var result = await storeService.GetAdminStoresAsync(searchParams);
        return Results.Ok(result);
    }

    // Get stores for dropdown (lightweight, no pagination)
    private static async Task<IResult> GetStoresDropdown(StoreRepository storeRepository)
    {
        var result = await storeRepository.GetStoresForDropdownAsync();
        return Results.Ok(result);
    }

    // T116: Get single store for admin
    private static async Task<IResult> GetStore(
        Guid id,
        StoreService storeService)
    {
        var store = await storeService.GetAdminStoreByIdAsync(id);
        if (store == null)
        {
            return Results.NotFound(new { message = "Store not found" });
        }

        return Results.Ok(store);
    }

    // T116: Create store
    private static async Task<IResult> CreateStore(
        [FromBody] StoreCreateDto createDto,
        StoreService storeService,
        IValidator<StoreCreateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(createDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await storeService.CreateStoreAsync(createDto);
        return Results.Created($"/api/admin/stores/{result.Id}", result);
    }

    // T116: Update store
    private static async Task<IResult> UpdateStore(
        Guid id,
        [FromBody] StoreUpdateDto updateDto,
        StoreService storeService,
        IValidator<StoreUpdateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await storeService.UpdateStoreAsync(id, updateDto);
        if (result == null)
        {
            return Results.NotFound(new { message = "Store not found" });
        }

        return Results.Ok(result);
    }

    // T116: Delete store
    private static async Task<IResult> DeleteStore(
        Guid id,
        StoreService storeService)
    {
        var success = await storeService.DeleteStoreAsync(id);
        if (!success)
        {
            return Results.NotFound(new { message = "Store not found" });
        }

        return Results.Ok(new { message = "Store deleted successfully" });
    }

    // T117: Upload store image
    private static async Task<IResult> UploadStoreImage(
        Guid id,
        IFormFile file,
        StoreService storeService,
        ImageService imageService)
    {
        if (file.Length == 0)
        {
            return Results.BadRequest(new { message = "No file uploaded" });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(new { message = "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
        }

        var maxSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxSize)
        {
            return Results.BadRequest(new { message = "File size exceeds 5MB limit" });
        }

        var imageUrl = await imageService.UploadImageAsync(file, $"stores/{id}");
        var result = await storeService.AddStoreImageAsync(id, imageUrl);

        if (result == null)
        {
            return Results.NotFound(new { message = "Store not found" });
        }

        return Results.Ok(result);
    }

    // T117: Delete store image
    private static async Task<IResult> DeleteStoreImage(
        Guid storeId,
        Guid imageId,
        StoreService storeService,
        ImageService imageService)
    {
        var image = await storeService.GetStoreImageAsync(storeId, imageId);
        if (image == null)
        {
            return Results.NotFound(new { message = "Image not found" });
        }

        await imageService.DeleteImageAsync(image.ImageUrl);
        var success = await storeService.DeleteStoreImageAsync(storeId, imageId);

        return Results.Ok(new { message = "Image deleted successfully" });
    }

    // Upload store logo
    private static async Task<IResult> UploadStoreLogo(
        Guid id, IFormFile file, StoreService storeService, ImageService imageService)
    {
        var (ok, error) = ValidateImageFile(file);
        if (!ok) return Results.BadRequest(new { message = error });

        // Delete old logo if exists
        var oldUrl = await storeService.GetStoreLogoUrlAsync(id);
        if (!string.IsNullOrEmpty(oldUrl)) await imageService.DeleteImageAsync(oldUrl);

        var imageUrl = await imageService.UploadImageAsync(file, $"stores/{id}/logo");
        var result = await storeService.UpdateStoreLogoAsync(id, imageUrl);
        if (result == null) return Results.NotFound(new { message = "Store not found" });

        return Results.Ok(new { imageUrl = result });
    }

    private static async Task<IResult> DeleteStoreLogo(
        Guid id, StoreService storeService, ImageService imageService)
    {
        var oldUrl = await storeService.GetStoreLogoUrlAsync(id);
        if (!string.IsNullOrEmpty(oldUrl)) await imageService.DeleteImageAsync(oldUrl);

        var success = await storeService.RemoveStoreLogoAsync(id);
        if (!success) return Results.NotFound(new { message = "Store not found" });

        return Results.Ok(new { message = "Logo removed" });
    }

    // Upload store banner
    private static async Task<IResult> UploadStoreBanner(
        Guid id, IFormFile file, StoreService storeService, ImageService imageService)
    {
        var (ok, error) = ValidateImageFile(file);
        if (!ok) return Results.BadRequest(new { message = error });

        var oldUrl = await storeService.GetStoreBannerUrlAsync(id);
        if (!string.IsNullOrEmpty(oldUrl)) await imageService.DeleteImageAsync(oldUrl);

        var imageUrl = await imageService.UploadImageAsync(file, $"stores/{id}/banner");
        var result = await storeService.UpdateStoreBannerAsync(id, imageUrl);
        if (result == null) return Results.NotFound(new { message = "Store not found" });

        return Results.Ok(new { imageUrl = result });
    }

    private static async Task<IResult> DeleteStoreBanner(
        Guid id, StoreService storeService, ImageService imageService)
    {
        var oldUrl = await storeService.GetStoreBannerUrlAsync(id);
        if (!string.IsNullOrEmpty(oldUrl)) await imageService.DeleteImageAsync(oldUrl);

        var success = await storeService.RemoveStoreBannerAsync(id);
        if (!success) return Results.NotFound(new { message = "Store not found" });

        return Results.Ok(new { message = "Banner removed" });
    }

    private static (bool Ok, string? Error) ValidateImageFile(IFormFile file)
    {
        if (file.Length == 0)
            return (false, "No file uploaded");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return (false, "Invalid file type. Only JPEG, PNG, and WebP are allowed.");

        var maxSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxSize)
            return (false, "File size exceeds 5MB limit");

        return (true, null);
    }

    // T130: Get all provinces for admin
    private static async Task<IResult> GetProvinces(ProvinceRepository provinceRepository)
    {
        var provinces = await provinceRepository.GetAdminProvincesAsync();
        return Results.Ok(provinces);
    }

    // T130: Get single province for admin
    private static async Task<IResult> GetProvince(Guid id, ProvinceRepository provinceRepository)
    {
        var province = await provinceRepository.GetAdminProvinceByIdAsync(id);
        if (province == null)
        {
            return Results.NotFound(new { message = "Province not found" });
        }
        return Results.Ok(province);
    }

    // T130: Update province
    private static async Task<IResult> UpdateProvince(
        Guid id,
        [FromBody] ProvinceUpdateDto updateDto,
        ProvinceRepository provinceRepository)
    {
        var result = await provinceRepository.UpdateAsync(id, updateDto);
        if (result == null)
        {
            return Results.NotFound(new { message = "Province not found" });
        }
        return Results.Ok(result);
    }

    // T131: Get all categories for admin
    private static async Task<IResult> GetCategories(CategoryRepository categoryRepository)
    {
        var categories = await categoryRepository.GetAdminCategoriesAsync();
        return Results.Ok(categories);
    }

    // T131: Get single category for admin
    private static async Task<IResult> GetCategory(Guid id, CategoryRepository categoryRepository)
    {
        var category = await categoryRepository.GetAdminCategoryByIdAsync(id);
        if (category == null)
        {
            return Results.NotFound(new { message = "Category not found" });
        }
        return Results.Ok(category);
    }

    // T131: Create category
    private static async Task<IResult> CreateCategory(
        [FromBody] CategoryCreateDto createDto,
        CategoryRepository categoryRepository,
        IValidator<CategoryCreateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(createDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await categoryRepository.CreateAsync(createDto);
        return Results.Created($"/api/admin/categories/{result.Id}", result);
    }

    // T131: Update category
    private static async Task<IResult> UpdateCategory(
        Guid id,
        [FromBody] CategoryUpdateDto updateDto,
        CategoryRepository categoryRepository,
        IValidator<CategoryUpdateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await categoryRepository.UpdateAsync(id, updateDto);
        if (result == null)
        {
            return Results.NotFound(new { message = "Category not found" });
        }
        return Results.Ok(result);
    }

    // T131: Delete category
    private static async Task<IResult> DeleteCategory(Guid id, CategoryRepository categoryRepository)
    {
        var success = await categoryRepository.DeleteAsync(id);
        if (!success)
        {
            return Results.BadRequest(new { message = "ไม่สามารถลบประเภทร้านที่มีร้านค้าอยู่ได้" });
        }
        return Results.Ok(new { message = "Category deleted successfully" });
    }

    // T140: Get all ads for admin
    private static async Task<IResult> GetAds(AdRepository adRepository)
    {
        var ads = await adRepository.GetAdminAdsAsync();
        return Results.Ok(ads);
    }

    // T140: Get single ad for admin
    private static async Task<IResult> GetAd(Guid id, AdRepository adRepository)
    {
        var ad = await adRepository.GetAdminAdByIdAsync(id);
        if (ad == null)
        {
            return Results.NotFound(new { message = "Ad not found" });
        }
        return Results.Ok(ad);
    }

    // T140: Create ad
    private static async Task<IResult> CreateAd(
        [FromBody] AdCreateDto createDto,
        AdRepository adRepository,
        IValidator<AdCreateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(createDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await adRepository.CreateAsync(createDto);
        return Results.Created($"/api/admin/ads/{result.Id}", result);
    }

    // T140: Update ad
    private static async Task<IResult> UpdateAd(
        Guid id,
        [FromBody] AdUpdateDto updateDto,
        AdRepository adRepository,
        IValidator<AdUpdateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await adRepository.UpdateAsync(id, updateDto);
        if (result == null)
        {
            return Results.NotFound(new { message = "Ad not found" });
        }
        return Results.Ok(result);
    }

    // T140: Delete ad
    private static async Task<IResult> DeleteAd(Guid id, AdRepository adRepository)
    {
        var success = await adRepository.DeleteAsync(id);
        if (!success)
        {
            return Results.NotFound(new { message = "Ad not found" });
        }
        return Results.Ok(new { message = "Ad deleted successfully" });
    }

    // T141: Get ad metrics
    private static async Task<IResult> GetAdMetrics(
        Guid id,
        [FromQuery] int? days,
        AdRepository adRepository)
    {
        var metrics = await adRepository.GetMetricsAsync(id, days ?? 30);
        if (metrics == null)
        {
            return Results.NotFound(new { message = "Ad not found" });
        }
        return Results.Ok(metrics);
    }

    // T142: Upload ad image
    private static async Task<IResult> UploadAdImage(
        Guid id,
        IFormFile file,
        AdRepository adRepository,
        ImageService imageService)
    {
        var ad = await adRepository.GetByIdAsync(id);
        if (ad == null)
        {
            return Results.NotFound(new { message = "Ad not found" });
        }

        if (file.Length == 0)
        {
            return Results.BadRequest(new { message = "No file uploaded" });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(new { message = "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
        }

        var maxSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxSize)
        {
            return Results.BadRequest(new { message = "File size exceeds 5MB limit" });
        }

        var imageUrl = await imageService.UploadImageAsync(file, $"ads/{id}");
        var result = await adRepository.UpdateAsync(id, new AdUpdateDto(ImageUrl: imageUrl));

        return Results.Ok(new { imageUrl = result?.ImageUrl });
    }

    // T143: Get all contacts
    private static async Task<IResult> GetContacts(ContactService contactService)
    {
        var contacts = await contactService.GetAllContactsAsync();
        return Results.Ok(contacts);
    }

    // T143: Get single contact
    private static async Task<IResult> GetContact(Guid id, ContactService contactService)
    {
        var contact = await contactService.GetContactByIdAsync(id);
        if (contact == null)
        {
            return Results.NotFound(new { message = "Contact not found" });
        }
        return Results.Ok(contact);
    }

    // T143: Mark contact as read
    private static async Task<IResult> MarkContactAsRead(Guid id, ContactService contactService)
    {
        var success = await contactService.MarkAsReadAsync(id);
        if (!success)
        {
            return Results.NotFound(new { message = "Contact not found" });
        }
        return Results.Ok(new { message = "Contact marked as read" });
    }

    // T143: Delete contact
    private static async Task<IResult> DeleteContact(Guid id, ContactService contactService)
    {
        var success = await contactService.DeleteContactAsync(id);
        if (!success)
        {
            return Results.NotFound(new { message = "Contact not found" });
        }
        return Results.Ok(new { message = "Contact deleted successfully" });
    }

    // T143: Get unread contact count
    private static async Task<IResult> GetUnreadContactCount(ContactService contactService)
    {
        var count = await contactService.GetUnreadCountAsync();
        return Results.Ok(new { count });
    }

    // Dashboard stats
    private static async Task<IResult> GetDashboardStats(NightniceDbContext db)
    {
        var today = DateTime.UtcNow.Date;

        var activeStores = await db.Stores.CountAsync(s => s.IsActive);
        var activeEvents = await db.Events.CountAsync(e => e.IsActive);
        var pendingClaims = await db.EntityClaims.CountAsync(c => c.Status == ClaimStatus.Pending);
        var pendingProposals = await db.EntityProposals.CountAsync(p => p.Status == ProposalStatus.Pending);
        var pendingUpdates = await db.EntityUpdateRequests.CountAsync(u => u.Status == UpdateRequestStatus.Pending);
        var unreadContacts = await db.ContactInquiries.CountAsync(c => !c.IsRead);
        var totalMoodFeedback = await db.StoreMoodFeedbacks.CountAsync();
        var moodFeedbackToday = await db.StoreMoodFeedbacks.CountAsync(f => f.CreatedAt >= today);
        var totalUsers = await db.Users.CountAsync();
        var reportedReviews = await db.ReviewReports.Select(r => r.ReviewId).Distinct().CountAsync();

        return Results.Ok(new AdminDashboardDto(
            activeStores, activeEvents, pendingClaims, pendingProposals,
            pendingUpdates, unreadContacts, totalMoodFeedback, moodFeedbackToday,
            totalUsers, reportedReviews
        ));
    }

    private static async Task<IResult> GetModerationClaims(
        [AsParameters] ModerationFilterParams filter,
        NightniceDbContext db)
    {
        var query = db.EntityClaims
            .AsNoTracking()
            .Include(c => c.RequestedBy)
            .AsQueryable();

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        if (filter.EntityType.HasValue)
        {
            query = query.Where(c => c.EntityType == filter.EntityType.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            if (!Enum.TryParse<ClaimStatus>(filter.Status, true, out var status))
            {
                return Results.BadRequest(new { message = "Invalid claim status" });
            }
            query = query.Where(c => c.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminEntityClaimDto(
                c.Id,
                c.EntityType,
                c.EntityId,
                c.EntityType == ManagedEntityType.Store
                    ? db.Stores.Where(s => s.Id == c.EntityId).Select(s => s.Name).FirstOrDefault()
                    : db.Events.Where(e => e.Id == c.EntityId).Select(e => e.Title).FirstOrDefault(),
                c.EntityType == ManagedEntityType.Store
                    ? db.Stores.Where(s => s.Id == c.EntityId).Select(s => s.Slug).FirstOrDefault()
                    : db.Events.Where(e => e.Id == c.EntityId).Select(e => e.Slug).FirstOrDefault(),
                c.RequestedBy.DisplayName ?? c.RequestedBy.Email,
                c.RequestedBy.Email,
                c.EvidenceUrl,
                c.Notes,
                c.Status,
                c.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        return Results.Ok(new PaginatedResult<AdminEntityClaimDto>(items, totalCount, page, pageSize, totalPages));
    }

    private static async Task<IResult> GetModerationUpdates(
        [AsParameters] ModerationFilterParams filter,
        NightniceDbContext db)
    {
        var query = db.EntityUpdateRequests
            .AsNoTracking()
            .Include(r => r.SubmittedBy)
            .AsQueryable();

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        if (filter.EntityType.HasValue)
        {
            query = query.Where(r => r.EntityType == filter.EntityType.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            if (!Enum.TryParse<UpdateRequestStatus>(filter.Status, true, out var status))
            {
                return Results.BadRequest(new { message = "Invalid update status" });
            }
            query = query.Where(r => r.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminEntityUpdateRequestDto(
                r.Id,
                r.EntityType,
                r.EntityId,
                r.EntityType == ManagedEntityType.Store
                    ? db.Stores.Where(s => s.Id == r.EntityId).Select(s => s.Name).FirstOrDefault()
                    : db.Events.Where(e => e.Id == r.EntityId).Select(e => e.Title).FirstOrDefault(),
                r.EntityType == ManagedEntityType.Store
                    ? db.Stores.Where(s => s.Id == r.EntityId).Select(s => s.Slug).FirstOrDefault()
                    : db.Events.Where(e => e.Id == r.EntityId).Select(e => e.Slug).FirstOrDefault(),
                r.SubmittedBy.DisplayName ?? r.SubmittedBy.Email,
                r.SubmittedBy.Email,
                r.Status,
                r.PayloadJson,
                r.ProofMediaUrl,
                r.ExternalProofUrl,
                r.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        return Results.Ok(new PaginatedResult<AdminEntityUpdateRequestDto>(items, totalCount, page, pageSize, totalPages));
    }

    private static async Task<IResult> GetModerationProposals(
        [AsParameters] ModerationFilterParams filter,
        NightniceDbContext db)
    {
        var query = db.EntityProposals
            .AsNoTracking()
            .AsQueryable();

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        if (filter.EntityType.HasValue)
        {
            query = query.Where(p => p.EntityType == filter.EntityType.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            if (!Enum.TryParse<ProposalStatus>(filter.Status, true, out var status))
            {
                return Results.BadRequest(new { message = "Invalid proposal status" });
            }
            query = query.Where(p => p.Status == status);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminEntityProposalDto(
                p.Id,
                p.EntityType,
                p.Name,
                p.ReferenceUrl,
                p.PayloadJson,
                p.Status,
                p.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        return Results.Ok(new PaginatedResult<AdminEntityProposalDto>(items, totalCount, page, pageSize, totalPages));
    }

    private static async Task<IResult> DecideClaim(
        Guid id,
        [FromBody] ModerationDecisionDto decision,
        EntityModerationService moderationService)
    {
        var claim = await moderationService.GetClaimByIdAsync(id);
        if (claim == null)
        {
            return Results.NotFound(new { message = "Claim not found" });
        }

        if (!Enum.TryParse<ClaimStatus>(decision.Decision, true, out var status) || status == ClaimStatus.Pending)
        {
            return Results.BadRequest(new { message = "Invalid decision" });
        }

        await moderationService.UpdateClaimStatusAsync(claim, status, null, decision.Notes);
        return Results.Ok(new { message = "Claim updated" });
    }

    private static async Task<IResult> DecideUpdateRequest(
        Guid id,
        [FromBody] ModerationDecisionDto decision,
        EntityModerationService moderationService)
    {
        var request = await moderationService.GetUpdateRequestByIdAsync(id);
        if (request == null)
        {
            return Results.NotFound(new { message = "Update request not found" });
        }

        if (!Enum.TryParse<UpdateRequestStatus>(decision.Decision, true, out var status) || status == UpdateRequestStatus.Pending)
        {
            return Results.BadRequest(new { message = "Invalid decision" });
        }

        await moderationService.UpdateUpdateRequestStatusAsync(request, status, null, decision.Notes);
        return Results.Ok(new { message = "Update request updated" });
    }

    private static async Task<IResult> DecideProposal(
        Guid id,
        [FromBody] ModerationDecisionDto decision,
        EntityModerationService moderationService)
    {
        var proposal = await moderationService.GetProposalByIdAsync(id);
        if (proposal == null)
        {
            return Results.NotFound(new { message = "Proposal not found" });
        }

        if (!Enum.TryParse<ProposalStatus>(decision.Decision, true, out var status) || status == ProposalStatus.Pending)
        {
            return Results.BadRequest(new { message = "Invalid decision" });
        }

        await moderationService.UpdateProposalStatusAsync(proposal, status, null, decision.Notes);
        return Results.Ok(new { message = "Proposal updated" });
    }

    // Event management endpoints
    private static async Task<IResult> GetEvents(
        [AsParameters] AdminEventSearchParams searchParams,
        EventService eventService)
    {
        var evtSearchParams = new EventSearchParams(
            Query: searchParams.Query,
            StoreId: searchParams.StoreId,
            EventType: searchParams.EventType,
            Page: searchParams.Page,
            PageSize: searchParams.PageSize
        );
        var result = await eventService.GetAdminEventsAsync(evtSearchParams);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetEvent(
        Guid id,
        EventService eventService)
    {
        var evt = await eventService.GetAdminEventByIdAsync(id);
        if (evt == null)
        {
            return Results.NotFound(new { message = "Event not found" });
        }
        return Results.Ok(evt);
    }

    private static async Task<IResult> CreateEvent(
        [FromBody] EventCreateDto createDto,
        EventService eventService,
        IValidator<EventCreateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(createDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await eventService.CreateEventAsync(createDto);
        return Results.Created($"/api/admin/events/{result.Id}", result);
    }

    private static async Task<IResult> UpdateEvent(
        Guid id,
        [FromBody] EventUpdateDto updateDto,
        EventService eventService,
        IValidator<EventUpdateDto> validator)
    {
        var validationResult = await validator.ValidateAsync(updateDto);
        if (!validationResult.IsValid)
        {
            return Results.BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var result = await eventService.UpdateEventAsync(id, updateDto);
        if (result == null)
        {
            return Results.NotFound(new { message = "Event not found" });
        }
        return Results.Ok(result);
    }

    private static async Task<IResult> DeleteEvent(
        Guid id,
        EventService eventService)
    {
        var success = await eventService.DeleteEventAsync(id);
        if (!success)
        {
            return Results.NotFound(new { message = "Event not found" });
        }
        return Results.Ok(new { message = "Event deleted successfully" });
    }

    private static async Task<IResult> UploadEventImage(
        Guid id,
        IFormFile file,
        EventService eventService,
        ImageService imageService)
    {
        var evt = await eventService.GetAdminEventByIdAsync(id);
        if (evt == null)
        {
            return Results.NotFound(new { message = "Event not found" });
        }

        if (file.Length == 0)
        {
            return Results.BadRequest(new { message = "No file uploaded" });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(new { message = "Invalid file type. Only JPEG, PNG, and WebP are allowed." });
        }

        var maxSize = 5 * 1024 * 1024; // 5MB
        if (file.Length > maxSize)
        {
            return Results.BadRequest(new { message = "File size exceeds 5MB limit" });
        }

        var imageUrl = await imageService.UploadImageAsync(file, $"events/{id}");
        var result = await eventService.UpdateEventAsync(id, new EventUpdateDto(ImageUrl: imageUrl));

        return Results.Ok(new { imageUrl = result?.ImageUrl });
    }
}

public record AdminDashboardDto(
    int ActiveStores,
    int ActiveEvents,
    int PendingClaims,
    int PendingProposals,
    int PendingUpdates,
    int UnreadContacts,
    int TotalMoodFeedback,
    int MoodFeedbackToday,
    int TotalUsers,
    int ReportedReviews
);

// Search params for admin store list
public record AdminStoreSearchParams(
    string? Query = null,
    string? ProvinceId = null,
    string? CategoryId = null,
    bool? IsActive = null,
    bool? IsFeatured = null,
    int Page = 1,
    int PageSize = 20
);

// Search params for admin event list
public record AdminEventSearchParams(
    string? Query = null,
    Guid? StoreId = null,
    string? EventType = null,
    int Page = 1,
    int PageSize = 20
);
