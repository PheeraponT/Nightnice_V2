namespace Nightnice.Api.Models;

/// <summary>
/// ร้านกลางคืน
/// </summary>
public class Store
{
    public Guid Id { get; set; }

    /// <summary>
    /// จังหวัดที่ร้านตั้งอยู่
    /// </summary>
    public Guid ProvinceId { get; set; }

    /// <summary>
    /// ชื่อร้าน
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// URL-friendly identifier (unique)
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>
    /// คำอธิบายร้าน
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// URL รูป Logo
    /// </summary>
    public string? LogoUrl { get; set; }

    /// <summary>
    /// URL รูป Banner
    /// </summary>
    public string? BannerUrl { get; set; }

    /// <summary>
    /// เบอร์โทรศัพท์
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// ที่อยู่
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// พิกัดละติจูด
    /// </summary>
    public decimal? Latitude { get; set; }

    /// <summary>
    /// พิกัดลองจิจูด
    /// </summary>
    public decimal? Longitude { get; set; }

    /// <summary>
    /// URL Google Maps
    /// </summary>
    public string? GoogleMapUrl { get; set; }

    /// <summary>
    /// LINE ID หรือ LINE OA
    /// </summary>
    public string? LineId { get; set; }

    /// <summary>
    /// URL Facebook page
    /// </summary>
    public string? FacebookUrl { get; set; }

    /// <summary>
    /// URL Instagram profile
    /// </summary>
    public string? InstagramUrl { get; set; }

    /// <summary>
    /// ช่วงราคา (1=$, 2=$$, 3=$$$, 4=$$$$)
    /// </summary>
    public short? PriceRange { get; set; }

    /// <summary>
    /// เวลาเปิด
    /// </summary>
    public TimeOnly? OpenTime { get; set; }

    /// <summary>
    /// เวลาปิด (รองรับข้ามวัน)
    /// </summary>
    public TimeOnly? CloseTime { get; set; }

    /// <summary>
    /// สิ่งอำนวยความสะดวก (JSON array)
    /// </summary>
    public List<string> Facilities { get; set; } = [];

    /// <summary>
    /// สถานะการแสดงผล
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// ร้านแนะนำ
    /// </summary>
    public bool IsFeatured { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Province Province { get; set; } = null!;
    public ICollection<StoreCategory> StoreCategories { get; set; } = [];
    public ICollection<StoreImage> Images { get; set; } = [];
    public ICollection<Advertisement> Advertisements { get; set; } = [];
    public ICollection<Event> Events { get; set; } = [];
    public ICollection<StoreView> Views { get; set; } = [];
    public ICollection<StoreMoodFeedback> MoodFeedbacks { get; set; } = [];
    public ICollection<UserFavoriteStore> FavoritedBy { get; set; } = [];
}
