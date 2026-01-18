namespace Nightnice.Api.Models;

/// <summary>
/// ภูมิภาค (6 regions: กลาง, เหนือ, อีสาน, ตะวันออก, ตะวันตก, ใต้)
/// </summary>
public class Region
{
    public Guid Id { get; set; }

    /// <summary>
    /// ชื่อภูมิภาค (กลาง, เหนือ, อีสาน, ตะวันออก, ตะวันตก, ใต้)
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

    // Navigation properties
    public ICollection<Province> Provinces { get; set; } = [];
}
