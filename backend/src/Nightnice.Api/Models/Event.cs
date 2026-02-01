namespace Nightnice.Api.Models;

/// <summary>
/// ประเภทอีเวนท์
/// </summary>
public enum EventType
{
    /// <summary>ดีเจไนท์</summary>
    DjNight,
    /// <summary>ดนตรีสด</summary>
    LiveMusic,
    /// <summary>ปาร์ตี้</summary>
    Party,
    /// <summary>อีเวนท์พิเศษ</summary>
    SpecialEvent,
    /// <summary>เลดี้ไนท์</summary>
    LadiesNight,
    /// <summary>แฮปปี้อาวร์</summary>
    HappyHour,
    /// <summary>ไนท์ธีม</summary>
    ThemeNight,
    /// <summary>คอนเสิร์ต</summary>
    Concert,
    /// <summary>โปรโมชั่น</summary>
    Promotion,
    /// <summary>อื่นๆ</summary>
    Other
}

/// <summary>
/// อีเวนท์/กิจกรรม ของร้าน
/// </summary>
public class Event
{
    public Guid Id { get; set; }

    /// <summary>
    /// ร้านที่จัดอีเวนท์
    /// </summary>
    public Guid StoreId { get; set; }

    /// <summary>
    /// ประเภทอีเวนท์
    /// </summary>
    public EventType EventType { get; set; }

    /// <summary>
    /// ชื่ออีเวนท์
    /// </summary>
    public required string Title { get; set; }

    /// <summary>
    /// URL-friendly identifier (unique)
    /// </summary>
    public required string Slug { get; set; }

    /// <summary>
    /// รายละเอียดอีเวนท์
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// URL รูปโปสเตอร์/Cover
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// วันที่เริ่ม
    /// </summary>
    public DateOnly StartDate { get; set; }

    /// <summary>
    /// วันที่สิ้นสุด (null = single day event)
    /// </summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>
    /// เวลาเริ่ม
    /// </summary>
    public TimeOnly? StartTime { get; set; }

    /// <summary>
    /// เวลาสิ้นสุด
    /// </summary>
    public TimeOnly? EndTime { get; set; }

    /// <summary>
    /// ราคาเข้าร่วม (0 = ฟรี, null = ไม่ระบุ)
    /// </summary>
    public decimal? Price { get; set; }

    /// <summary>
    /// ช่วงราคาสูงสุด (for range display)
    /// </summary>
    public decimal? PriceMax { get; set; }

    /// <summary>
    /// URL สำหรับซื้อตั๋ว/จอง
    /// </summary>
    public string? TicketUrl { get; set; }

    /// <summary>
    /// เป็นอีเวนท์ที่จัดซ้ำหรือไม่
    /// </summary>
    public bool IsRecurring { get; set; }

    /// <summary>
    /// รูปแบบการจัดซ้ำ (JSON format)
    /// เช่น { "pattern": "weekly", "daysOfWeek": [5, 6] }
    /// </summary>
    public string? RecurrencePattern { get; set; }

    /// <summary>
    /// สถานะการแสดงผล
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// อีเวนท์แนะนำ/Featured
    /// </summary>
    public bool IsFeatured { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Store Store { get; set; } = null!;
}
