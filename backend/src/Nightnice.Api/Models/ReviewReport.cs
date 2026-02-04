namespace Nightnice.Api.Models;

public class ReviewReport
{
    public Guid Id { get; set; }

    // Foreign keys
    public Guid ReviewId { get; set; }
    public Guid ReportedByUserId { get; set; }

    // Report details
    public required string Reason { get; set; } // spam, offensive, fake, inappropriate, other
    public string? Description { get; set; } // Additional details

    // Admin review
    public bool IsReviewed { get; set; } = false;
    public Guid? ReviewedByAdminId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? AdminAction { get; set; } // dismissed, hidden, banned_user
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Review Review { get; set; } = null!;
    public User ReportedByUser { get; set; } = null!;
    public AdminUser? ReviewedByAdmin { get; set; }
}
