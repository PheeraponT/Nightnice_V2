using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class UserRepository
{
    private readonly NightniceDbContext _context;

    public UserRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByFirebaseUidAsync(string firebaseUid)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateLastLoginAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdatePreferencesAsync(Guid userId, bool shareLocation, bool allowMoodDigest, bool marketingUpdates)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        user.ShareLocation = shareLocation;
        user.AllowMoodDigest = allowMoodDigest;
        user.MarketingUpdates = marketingUpdates;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Guid>> GetFavoriteStoreIdsAsync(Guid userId)
    {
        return await _context.UserFavoriteStores
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.StoreId)
            .ToListAsync();
    }

    public async Task AddFavoriteAsync(Guid userId, Guid storeId)
    {
        var exists = await _context.UserFavoriteStores.AnyAsync(f => f.UserId == userId && f.StoreId == storeId);
        if (exists)
        {
            return;
        }

        _context.UserFavoriteStores.Add(new UserFavoriteStore
        {
            UserId = userId,
            StoreId = storeId,
            CreatedAt = DateTime.UtcNow,
        });

        await _context.SaveChangesAsync();
    }

    public async Task RemoveFavoriteAsync(Guid userId, Guid storeId)
    {
        var favorite = await _context.UserFavoriteStores.FindAsync(userId, storeId);
        if (favorite != null)
        {
            _context.UserFavoriteStores.Remove(favorite);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearFavoritesAsync(Guid userId)
    {
        var favorites = await _context.UserFavoriteStores
            .Where(f => f.UserId == userId)
            .ToListAsync();

        if (favorites.Count == 0)
        {
            return;
        }

        _context.UserFavoriteStores.RemoveRange(favorites);
        await _context.SaveChangesAsync();
    }
}
