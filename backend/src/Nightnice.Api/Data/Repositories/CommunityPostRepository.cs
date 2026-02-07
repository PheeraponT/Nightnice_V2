using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class CommunityPostRepository
{
    private readonly NightniceDbContext _dbContext;

    public CommunityPostRepository(NightniceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PaginatedResult<CommunityPostDto>> GetFeedAsync(CommunityPostFeedParams feedParams)
    {
        var query = _dbContext.CommunityPosts
            .AsNoTracking()
            .Where(p => p.IsPublished)
            .Include(p => p.Images)
            .Include(p => p.Store)
                .ThenInclude(s => s.Province)
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(feedParams.MoodId))
        {
            query = query.Where(p => p.MoodId == feedParams.MoodId);
        }

        if (feedParams.StoreId.HasValue)
        {
            query = query.Where(p => p.StoreId == feedParams.StoreId.Value);
        }

        var totalCount = await query.CountAsync();
        var page = Math.Max(1, feedParams.Page);
        var pageSize = Math.Clamp(feedParams.PageSize, 1, 24);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(CommunityPostSelector)
            .ToListAsync();

        return new PaginatedResult<CommunityPostDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<CommunityPostDto> CreateAsync(CommunityPost post, IEnumerable<CommunityPostImage> images)
    {
        foreach (var image in images.Select((img, index) => (img, index)))
        {
            image.img.CommunityPostId = post.Id;
            image.img.SortOrder = image.index;
        }

        post.Images = images.ToList();

        await _dbContext.CommunityPosts.AddAsync(post);
        await _dbContext.SaveChangesAsync();

        return await _dbContext.CommunityPosts
            .AsNoTracking()
            .Where(p => p.Id == post.Id)
            .Select(CommunityPostSelector)
            .FirstAsync();
    }

    public async Task<List<CommunityPostDto>> GetUserPostsAsync(Guid userId, int limit)
    {
        var normalizedLimit = Math.Clamp(limit, 1, 50);

        return await _dbContext.CommunityPosts
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(normalizedLimit)
            .Select(CommunityPostSelector)
            .ToListAsync();
    }

    public async Task<CommunityPost?> GetByIdAsync(Guid postId)
    {
        return await _dbContext.CommunityPosts
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == postId);
    }

    public async Task<CommunityPostDto> UpdateAsync(CommunityPost post, IEnumerable<CommunityPostImage> newImages)
    {
        var oldImages = await _dbContext.CommunityPostImages
            .Where(i => i.CommunityPostId == post.Id)
            .ToListAsync();
        _dbContext.CommunityPostImages.RemoveRange(oldImages);

        foreach (var (img, index) in newImages.Select((img, index) => (img, index)))
        {
            img.CommunityPostId = post.Id;
            img.SortOrder = index;
        }
        await _dbContext.CommunityPostImages.AddRangeAsync(newImages);

        post.UpdatedAt = DateTime.UtcNow;
        _dbContext.CommunityPosts.Update(post);
        await _dbContext.SaveChangesAsync();

        return await _dbContext.CommunityPosts
            .AsNoTracking()
            .Where(p => p.Id == post.Id)
            .Select(CommunityPostSelector)
            .FirstAsync();
    }

    public async Task<bool> DeleteAsync(Guid postId)
    {
        var post = await _dbContext.CommunityPosts.FindAsync(postId);
        if (post == null) return false;

        _dbContext.CommunityPosts.Remove(post);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private static readonly System.Linq.Expressions.Expression<Func<CommunityPost, CommunityPostDto>> CommunityPostSelector =
        p => new CommunityPostDto(
            p.Id,
            p.Title,
            p.Summary,
            p.Story,
            p.MoodId,
            p.MoodMatch,
            p.VibeTags,
            new CommunityPostStoreDto(
                p.StoreId,
                p.Store.Name,
                p.Store.Slug,
                p.Store.Province != null ? p.Store.Province.Name : null
            ),
            new CommunityPostAuthorDto(
                p.UserId,
                p.User.DisplayName ?? p.User.Email,
                p.User.PhotoUrl
            ),
            p.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => new CommunityPostImageDto(i.Id, i.Url, i.AltText, i.SortOrder)),
            p.CreatedAt
        );
}
