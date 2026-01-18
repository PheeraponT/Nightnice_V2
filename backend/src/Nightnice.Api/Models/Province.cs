namespace Nightnice.Api.Models;

/// <summary>
/// จังหวัด (77 provinces)
/// </summary>
public class Province
{
    public Guid Id { get; set; }

    /// <summary>
    /// ภูมิภาคที่จังหวัดสังกัด
    /// </summary>
    public Guid RegionId { get; set; }

    /// <summary>
    /// ชื่อจังหวัด
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// URL-friendly identifier
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>
    /// ข้อความแนะนำสำหรับ SEO
    /// </summary>
    public string? SeoDescription { get; set; }

    /// <summary>
    /// ลำดับการแสดงผล
    /// </summary>
    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Region Region { get; set; } = null!;
    public ICollection<Store> Stores { get; set; } = [];
}
