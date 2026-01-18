using System.ComponentModel.DataAnnotations;

namespace Nightnice.Api.DTOs;

// T111: Auth DTOs for admin authentication

public record LoginDto(
    [Required(ErrorMessage = "Username is required")]
    string Username,

    [Required(ErrorMessage = "Password is required")]
    string Password
);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    AdminUserDto User
);

public record RefreshTokenDto(
    [Required(ErrorMessage = "Refresh token is required")]
    string RefreshToken
);

public record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

public record AdminUserDto(
    Guid Id,
    string Username,
    string Email
);
