namespace Nightnice.Api.Models;

/// <summary>
/// รูปภาพร้าน Gallery
/// </summary>
public class StoreImage
{
    public Guid Id { get; set; }

    /// <summary>
    /// ร้านที่รูปภาพสังกัด
    /// </summary>
    public Guid StoreId { get; set; }

    /// <summary>
    /// URL รูปภาพ
    /// </summary>
    public required string Url { get; set; }

    /// <summary>
    /// ลำดับการแสดงผล
    /// </summary>
    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Store Store { get; set; } = null!;
}
