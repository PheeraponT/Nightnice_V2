namespace Nightnice.Api.Models;

/// <summary>
/// ผู้ดูแลระบบ
/// </summary>
public class AdminUser
{
    public Guid Id { get; set; }

    /// <summary>
    /// ชื่อผู้ใช้
    /// </summary>
    public required string Username { get; set; }

    /// <summary>
    /// รหัสผ่าน (BCrypt hashed)
    /// </summary>
    public required string PasswordHash { get; set; }

    /// <summary>
    /// อีเมล
    /// </summary>
    public required string Email { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
