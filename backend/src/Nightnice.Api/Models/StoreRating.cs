namespace Nightnice.Api.Models;

/// <summary>
/// Denormalized rating stats for performance
/// </summary>
public class StoreRating
{
    public Guid StoreId { get; set; }

    // Aggregated stats
    public decimal AverageRating { get; set; } = 0; // 0.00 - 5.00
    public int TotalReviews { get; set; } = 0;
    public int TotalRating5 { get; set; } = 0;
    public int TotalRating4 { get; set; } = 0;
    public int TotalRating3 { get; set; } = 0;
    public int TotalRating2 { get; set; } = 0;
    public int TotalRating1 { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Store Store { get; set; } = null!;
}
