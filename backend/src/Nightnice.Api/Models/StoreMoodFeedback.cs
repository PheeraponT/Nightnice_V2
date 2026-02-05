namespace Nightnice.Api.Models;

public class StoreMoodFeedback
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ReviewId { get; set; }

    public required string MoodCode { get; set; } // chill, social, romantic, party, adventurous, solo
    public short EnergyScore { get; set; }
    public short MusicScore { get; set; }
    public short CrowdScore { get; set; }
    public short ConversationScore { get; set; }
    public short CreativityScore { get; set; }
    public short ServiceScore { get; set; }

    public string? HighlightQuote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Store Store { get; set; } = null!;
    public User User { get; set; } = null!;
    public Review? Review { get; set; }
}
