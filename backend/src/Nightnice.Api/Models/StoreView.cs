namespace Nightnice.Api.Models;

/// <summary>
/// Store page view tracking for popularity metrics
/// </summary>
public class StoreView
{
    public Guid Id { get; set; }

    public Guid StoreId { get; set; }

    /// <summary>
    /// Page context where the view originated (e.g., /store/slug, /province/x)
    /// </summary>
    public string? Referrer { get; set; }

    /// <summary>
    /// Session identifier for deduplication (hashed IP + User-Agent)
    /// </summary>
    public string? SessionHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Store Store { get; set; } = null!;
}
