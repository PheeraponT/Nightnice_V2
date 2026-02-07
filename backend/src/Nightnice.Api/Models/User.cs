namespace Nightnice.Api.Models;

public class User
{
    public Guid Id { get; set; }

    // Firebase UID is the unique identifier from Firebase Auth
    public required string FirebaseUid { get; set; }

    // User profile information
    public required string Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PhotoUrl { get; set; }

    // Provider info (google.com, facebook.com, etc.)
    public string? Provider { get; set; }

    // Preferences
    public bool ShareLocation { get; set; } = true;
    public bool AllowMoodDigest { get; set; } = true;
    public bool MarketingUpdates { get; set; } = false;

    // Account status
    public bool IsActive { get; set; } = true;
    public bool IsBanned { get; set; } = false;
    public string? BanReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<Store> OwnedStores { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<ReviewHelpful> HelpfulVotes { get; set; } = [];
    public ICollection<ReviewReport> Reports { get; set; } = [];
    public ICollection<StoreMoodFeedback> MoodFeedbacks { get; set; } = [];
    public ICollection<UserFavoriteStore> Favorites { get; set; } = [];
    public ICollection<CommunityPost> CommunityPosts { get; set; } = [];
}
