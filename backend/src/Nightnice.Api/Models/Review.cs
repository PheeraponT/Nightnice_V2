namespace Nightnice.Api.Models;

public class Review
{
    public Guid Id { get; set; }

    // Foreign keys
    public Guid StoreId { get; set; }
    public Guid UserId { get; set; }

    // Review content
    public short Rating { get; set; } // 1-5 stars
    public string? Title { get; set; } // Optional review title
    public required string Content { get; set; } // Review text

    // Metadata
    public bool IsVerifiedVisit { get; set; } = false; // Future: verify actual visit
    public bool IsActive { get; set; } = true; // Soft delete / admin hide
    public string? AdminNote { get; set; } // Internal notes if hidden

    // Owner reply
    public string? OwnerReply { get; set; }
    public DateTime? OwnerReplyAt { get; set; }

    // Stats (denormalized for performance)
    public int HelpfulCount { get; set; } = 0;
    public int ReportCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Store Store { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<ReviewHelpful> HelpfulVotes { get; set; } = [];
    public ICollection<ReviewReport> Reports { get; set; } = [];
    public StoreMoodFeedback? MoodFeedback { get; set; }
}
