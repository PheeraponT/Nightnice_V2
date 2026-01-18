namespace Nightnice.Api.Models;

/// <summary>
/// ร้าน-ประเภท Many-to-Many join table
/// </summary>
public class StoreCategory
{
    public Guid StoreId { get; set; }
    public Guid CategoryId { get; set; }

    // Navigation properties
    public Store Store { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
