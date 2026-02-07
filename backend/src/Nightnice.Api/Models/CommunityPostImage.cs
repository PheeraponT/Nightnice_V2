namespace Nightnice.Api.Models;

public class CommunityPostImage
{
    public Guid Id { get; set; }
    public Guid CommunityPostId { get; set; }
    public required string Url { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }

    public CommunityPost Post { get; set; } = null!;
}
