using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Data;
using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

public class CommunityPostService
{
    private readonly CommunityPostRepository _postRepository;
    private readonly UserService _userService;
    private readonly NightniceDbContext _dbContext;
    private readonly ContentModerationService _moderationService;

    public CommunityPostService(
        CommunityPostRepository postRepository,
        UserService userService,
        NightniceDbContext dbContext,
        ContentModerationService moderationService)
    {
        _postRepository = postRepository;
        _userService = userService;
        _dbContext = dbContext;
        _moderationService = moderationService;
    }

    public Task<PaginatedResult<CommunityPostDto>> GetFeedAsync(CommunityPostFeedParams feedParams)
    {
        return _postRepository.GetFeedAsync(feedParams);
    }

    public Task<List<CommunityPostDto>> GetUserPostsAsync(Guid userId, int limit = 8)
    {
        return _postRepository.GetUserPostsAsync(userId, limit);
    }

    public async Task<CommunityPostDto> CreateAsync(Guid userId, CommunityPostCreateDto dto)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new InvalidOperationException("ไม่พบบัญชีผู้ใช้");
        }

        if (user.IsBanned || await _userService.IsBannedAsync(userId))
        {
            throw new InvalidOperationException("บัญชีนี้ถูกจำกัดการสร้างโพสต์");
        }

        var store = await _dbContext.Stores.FirstOrDefaultAsync(s => s.Id == dto.StoreId && s.IsActive);
        if (store == null)
        {
            throw new InvalidOperationException("ไม่พบร้านหรือร้านถูกปิดใช้งาน");
        }

        var moderationResult = _moderationService.AnalyzeFields(new Dictionary<string, string?>
        {
            ["title"] = dto.Title,
            ["summary"] = dto.Summary,
            ["story"] = dto.Story
        });

        if (!moderationResult.IsClean)
        {
            throw new InvalidOperationException($"เนื้อหามีคำไม่เหมาะสมในส่วน {moderationResult.Field}");
        }

        foreach (var imageAlt in dto.Images.Select(i => i.AltText).Where(a => !string.IsNullOrWhiteSpace(a)))
        {
            var imageCheck = _moderationService.AnalyzeFields(new Dictionary<string, string?> { ["altText"] = imageAlt });
            if (!imageCheck.IsClean)
            {
                throw new InvalidOperationException("คำอธิบายรูปมีคำไม่เหมาะสม");
            }
        }

        var post = new CommunityPost
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            StoreId = dto.StoreId,
            Title = dto.Title,
            Summary = dto.Summary,
            Story = dto.Story,
            MoodId = string.IsNullOrWhiteSpace(dto.MoodId) ? "chill" : dto.MoodId,
            MoodMatch = dto.MoodMatch,
            VibeTags = dto.VibeTags?.Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? []
        };

        var images = dto.Images
            .Select((img, index) => new CommunityPostImage
            {
                Id = Guid.NewGuid(),
                Url = img.Url,
                AltText = img.AltText,
                SortOrder = index
            })
            .ToList();

        return await _postRepository.CreateAsync(post, images);
    }

    public async Task<CommunityPostDto> UpdateAsync(Guid userId, Guid postId, CommunityPostUpdateDto dto)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
        {
            throw new InvalidOperationException("ไม่พบโพสต์");
        }

        if (post.UserId != userId)
        {
            throw new UnauthorizedAccessException("คุณไม่มีสิทธิ์แก้ไขโพสต์นี้");
        }

        var moderationResult = _moderationService.AnalyzeFields(new Dictionary<string, string?>
        {
            ["title"] = dto.Title,
            ["summary"] = dto.Summary,
            ["story"] = dto.Story
        });

        if (!moderationResult.IsClean)
        {
            throw new InvalidOperationException($"เนื้อหามีคำไม่เหมาะสมในส่วน {moderationResult.Field}");
        }

        post.Title = dto.Title;
        post.Summary = dto.Summary;
        post.Story = dto.Story;
        post.MoodId = string.IsNullOrWhiteSpace(dto.MoodId) ? "chill" : dto.MoodId;
        post.MoodMatch = dto.MoodMatch;
        post.VibeTags = dto.VibeTags?.Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? [];

        var newImages = dto.Images
            .Select((img, index) => new CommunityPostImage
            {
                Id = Guid.NewGuid(),
                Url = img.Url,
                AltText = img.AltText,
                SortOrder = index
            })
            .ToList();

        return await _postRepository.UpdateAsync(post, newImages);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
        {
            return false;
        }

        if (post.UserId != userId)
        {
            throw new UnauthorizedAccessException("คุณไม่มีสิทธิ์ลบโพสต์นี้");
        }

        return await _postRepository.DeleteAsync(postId);
    }
}
