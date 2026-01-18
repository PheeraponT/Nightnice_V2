namespace Nightnice.Api.Models;

/// <summary>
/// ประเภท event ของโฆษณา
/// </summary>
public enum AdEventType
{
    Impression,
    Click
}

/// <summary>
/// ข้อมูลการแสดงผลและคลิกโฆษณา
/// </summary>
public class AdMetric
{
    public Guid Id { get; set; }

    /// <summary>
    /// โฆษณาที่เกี่ยวข้อง
    /// </summary>
    public Guid AdId { get; set; }

    /// <summary>
    /// ประเภท: impression, click
    /// </summary>
    public AdEventType EventType { get; set; }

    /// <summary>
    /// หน้าที่แสดงโฆษณา
    /// </summary>
    public string? PageContext { get; set; }

    /// <summary>
    /// เวลาที่เกิดเหตุการณ์
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Advertisement Advertisement { get; set; } = null!;
}
