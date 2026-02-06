namespace Nightnice.Api.DTOs;

// User info for reviews
public record UserBasicDto(
    string DisplayName,
    string? PhotoUrl
);

// Public review display
public record ReviewDto(
    Guid Id,
    Guid StoreId,
    UserBasicDto User,
    short Rating,
    string? Title,
    string Content,
    int HelpfulCount,
    bool IsHelpfulByCurrentUser,
    string? OwnerReply,
    DateTime? OwnerReplyAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record MoodFeedbackInputDto(
    string MoodCode,
    short EnergyScore,
    short MusicScore,
    short CrowdScore,
    short ConversationScore,
    short CreativityScore,
    short ServiceScore,
    string? HighlightQuote
);

// Review submission
public record ReviewCreateDto(
    Guid StoreId,
    short Rating,
    string? Title,
    string Content,
    MoodFeedbackInputDto? MoodFeedback = null
);

// Review update
public record ReviewUpdateDto(
    short Rating,
    string? Title,
    string Content,
    MoodFeedbackInputDto? MoodFeedback = null
);

// Review statistics
public record ReviewStatsDto(
    decimal AverageRating,
    int TotalReviews,
    int TotalRating5,
    int TotalRating4,
    int TotalRating3,
    int TotalRating2,
    int TotalRating1
);

// Helpful vote toggle
public record ReviewHelpfulToggleDto(
    Guid ReviewId
);

// Report review
public record ReviewReportDto(
    Guid ReviewId,
    string Reason, // spam, offensive, fake, inappropriate, other
    string? Description
);

// Admin review list
public record AdminReviewListDto(
    Guid Id,
    Guid StoreId,
    string StoreName,
    UserBasicDto User,
    short Rating,
    string ContentPreview,
    int HelpfulCount,
    int ReportCount,
    bool IsActive,
    DateTime CreatedAt
);

// Admin review detail
public record AdminReviewDetailDto(
    Guid Id,
    Guid StoreId,
    string StoreName,
    Guid UserId,
    UserBasicDto User,
    short Rating,
    string? Title,
    string Content,
    int HelpfulCount,
    int ReportCount,
    bool IsActive,
    string? AdminNote,
    IEnumerable<ReviewReportDetailDto> Reports,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// Review report detail
public record ReviewReportDetailDto(
    Guid Id,
    Guid ReviewId,
    UserBasicDto ReportedByUser,
    string Reason,
    string? Description,
    bool IsReviewed,
    string? AdminAction,
    string? AdminNotes,
    DateTime CreatedAt
);

// Admin review update
public record AdminReviewUpdateDto(
    bool? IsActive,
    string? AdminNote
);

// Admin report review action
public record AdminReportReviewDto(
    Guid ReportId,
    string AdminAction, // dismissed, hidden, banned_user
    string? AdminNotes
);
