using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Auth;
using Nightnice.Api.Data;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

// T112: Admin authentication service
public class AdminAuthService
{
    private readonly NightniceDbContext _context;
    private readonly JwtService _jwtService;
    private readonly ILogger<AdminAuthService> _logger;

    // In-memory refresh token store (should use Redis in production)
    private static readonly Dictionary<string, (Guid UserId, DateTime Expiry)> _refreshTokens = new();

    public AdminAuthService(
        NightniceDbContext context,
        JwtService jwtService,
        ILogger<AdminAuthService> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.AdminUsers
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null)
        {
            _logger.LogWarning("Login attempt failed: user {Username} not found", loginDto.Username);
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login attempt failed: invalid password for user {Username}", loginDto.Username);
            return null;
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(24);

        // Store refresh token
        _refreshTokens[refreshToken] = (user.Id, DateTime.UtcNow.AddDays(7));

        _logger.LogInformation("User {Username} logged in successfully", user.Username);

        return new LoginResponse(
            accessToken,
            refreshToken,
            expiresAt,
            new AdminUserDto(user.Id, user.Username, user.Email)
        );
    }

    public async Task<RefreshTokenResponse?> RefreshTokenAsync(RefreshTokenDto refreshDto)
    {
        if (!_refreshTokens.TryGetValue(refreshDto.RefreshToken, out var tokenData))
        {
            _logger.LogWarning("Refresh token not found");
            return null;
        }

        if (tokenData.Expiry < DateTime.UtcNow)
        {
            _refreshTokens.Remove(refreshDto.RefreshToken);
            _logger.LogWarning("Refresh token expired");
            return null;
        }

        var user = await _context.AdminUsers.FindAsync(tokenData.UserId);
        if (user == null)
        {
            _refreshTokens.Remove(refreshDto.RefreshToken);
            _logger.LogWarning("User not found for refresh token");
            return null;
        }

        // Remove old refresh token and create new one
        _refreshTokens.Remove(refreshDto.RefreshToken);

        var accessToken = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(24);

        // Store new refresh token
        _refreshTokens[newRefreshToken] = (user.Id, DateTime.UtcNow.AddDays(7));

        _logger.LogInformation("Token refreshed for user {Username}", user.Username);

        return new RefreshTokenResponse(accessToken, newRefreshToken, expiresAt);
    }

    public void Logout(string refreshToken)
    {
        if (_refreshTokens.Remove(refreshToken))
        {
            _logger.LogInformation("Refresh token revoked");
        }
    }

    public async Task<AdminUser?> GetCurrentUserAsync(Guid userId)
    {
        return await _context.AdminUsers.FindAsync(userId);
    }
}
