using Nightnice.Api.Data.Repositories;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

public class UserService
{
    private readonly UserRepository _userRepository;

    public UserService(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    /// <summary>
    /// Get or create user from Firebase token
    /// </summary>
    public async Task<User> GetOrCreateUserAsync(string firebaseUid, string email, string? displayName, string? photoUrl, string? provider)
    {
        var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

        if (user == null)
        {
            // Create new user
            user = new User
            {
                Id = Guid.NewGuid(),
                FirebaseUid = firebaseUid,
                Email = email,
                DisplayName = displayName,
                PhotoUrl = photoUrl,
                Provider = provider,
                LastLoginAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);
        }
        else
        {
            // Update last login
            await _userRepository.UpdateLastLoginAsync(user.Id);
        }

        return user;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetByFirebaseUidAsync(string firebaseUid)
    {
        return await _userRepository.GetByFirebaseUidAsync(firebaseUid);
    }

    public async Task<bool> IsBannedAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user?.IsBanned ?? false;
    }
}
