namespace Nightnice.Api.Models;

/// <summary>
/// ข้อมูลติดต่อจากฟอร์มลงโฆษณา
/// </summary>
public class ContactInquiry
{
    public Guid Id { get; set; }

    /// <summary>
    /// ชื่อผู้ติดต่อ
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// อีเมล
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// เบอร์โทรศัพท์
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// ประเภทการติดต่อ
    /// </summary>
    public string InquiryType { get; set; } = "general";

    /// <summary>
    /// ข้อความ
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// ชื่อร้าน (ถ้ามี)
    /// </summary>
    public string? StoreName { get; set; }

    /// <summary>
    /// แพ็กเกจที่สนใจ
    /// </summary>
    public string? PackageInterest { get; set; }

    /// <summary>
    /// สถานะการอ่าน
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// วันที่ส่ง
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
