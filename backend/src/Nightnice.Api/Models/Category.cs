namespace Nightnice.Api.Models;

/// <summary>
/// ประเภทร้าน (ร้านเหล้า, บาร์, ผับ, ร้านอาหารกลางคืน)
/// </summary>
public class Category
{
    public Guid Id { get; set; }

    /// <summary>
    /// ชื่อประเภทร้าน
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// URL-friendly identifier
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>
    /// ลำดับการแสดงผล
    /// </summary>
    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<StoreCategory> StoreCategories { get; set; } = [];
}
