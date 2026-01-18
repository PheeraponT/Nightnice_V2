namespace Nightnice.Api.Models;

/// <summary>
/// ประเภทโฆษณา
/// </summary>
public enum AdType
{
    /// <summary>
    /// Banner โฆษณา (ใช้ image_url)
    /// </summary>
    Banner,

    /// <summary>
    /// Sponsored Store Card (ใช้ store_id)
    /// </summary>
    Sponsored,

    /// <summary>
    /// Featured Store (ใช้ store_id, ทำให้ร้านโดดเด่น)
    /// </summary>
    Featured
}

/// <summary>
/// โฆษณา
/// </summary>
public class Advertisement
{
    public Guid Id { get; set; }

    /// <summary>
    /// ประเภทโฆษณา: Banner, Sponsored, Featured
    /// </summary>
    public AdType Type { get; set; }

    /// <summary>
    /// ร้านที่เกี่ยวข้อง (ถ้ามี)
    /// </summary>
    public Guid? StoreId { get; set; }

    /// <summary>
    /// URL รูปภาพโฆษณา (สำหรับ banner)
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// URL ปลายทางเมื่อคลิก
    /// </summary>
    public string? TargetUrl { get; set; }

    /// <summary>
    /// จังหวัดเป้าหมาย (empty = ทุกจังหวัด)
    /// </summary>
    public List<Guid> TargetProvinces { get; set; } = [];

    /// <summary>
    /// ประเภทร้านเป้าหมาย (empty = ทุกประเภท)
    /// </summary>
    public List<Guid> TargetCategories { get; set; } = [];

    /// <summary>
    /// วันที่เริ่มแสดง
    /// </summary>
    public DateOnly StartDate { get; set; }

    /// <summary>
    /// วันที่สิ้นสุดแสดง
    /// </summary>
    public DateOnly EndDate { get; set; }

    /// <summary>
    /// สถานะการแสดงผล
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Store? Store { get; set; }
    public ICollection<AdMetric> Metrics { get; set; } = [];
}
