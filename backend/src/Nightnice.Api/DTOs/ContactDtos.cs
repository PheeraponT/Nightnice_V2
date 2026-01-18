using System.ComponentModel.DataAnnotations;

namespace Nightnice.Api.DTOs;

// T088: Contact inquiry DTOs for advertise page
public record ContactInquiryDto(
    [Required(ErrorMessage = "กรุณากรอกชื่อ")]
    [StringLength(100, ErrorMessage = "ชื่อต้องไม่เกิน 100 ตัวอักษร")]
    string Name,

    [Required(ErrorMessage = "กรุณากรอกอีเมล")]
    [EmailAddress(ErrorMessage = "รูปแบบอีเมลไม่ถูกต้อง")]
    string Email,

    [Phone(ErrorMessage = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง")]
    string? Phone,

    [Required(ErrorMessage = "กรุณาเลือกประเภทการติดต่อ")]
    string InquiryType,

    [Required(ErrorMessage = "กรุณากรอกข้อความ")]
    [StringLength(2000, ErrorMessage = "ข้อความต้องไม่เกิน 2000 ตัวอักษร")]
    string Message,

    string? StoreName,
    string? PackageInterest
);

public record ContactInquiryResponse(
    bool Success,
    string Message,
    Guid? ReferenceId
);
