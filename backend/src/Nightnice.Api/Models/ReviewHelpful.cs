namespace Nightnice.Api.Models;

/// <summary>
/// Many-to-many: Users can vote reviews as helpful
/// </summary>
public class ReviewHelpful
{
    public Guid ReviewId { get; set; }
    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Review Review { get; set; } = null!;
    public User User { get; set; } = null!;
}
