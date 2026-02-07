namespace Nightnice.Api.Models;

public class CommunityPost
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid StoreId { get; set; }

    public required string Title { get; set; }
    public string? Summary { get; set; }
    public string? Story { get; set; }
    public string MoodId { get; set; } = "chill";
    public short? MoodMatch { get; set; }
    public List<string> VibeTags { get; set; } = [];

    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Store Store { get; set; } = null!;
    public ICollection<CommunityPostImage> Images { get; set; } = [];
}
