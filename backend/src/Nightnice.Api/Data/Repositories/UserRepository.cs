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
}
