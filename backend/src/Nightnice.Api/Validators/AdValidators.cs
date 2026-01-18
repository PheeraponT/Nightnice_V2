using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

// T138: Ad validators
public class AdCreateDtoValidator : AbstractValidator<AdCreateDto>
{
    public AdCreateDtoValidator()
    {
        RuleFor(x => x.AdType)
            .NotEmpty().WithMessage("ประเภทโฆษณาจำเป็นต้องระบุ")
            .Must(BeValidAdType).WithMessage("ประเภทโฆษณาไม่ถูกต้อง (banner, sponsored, featured)");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("วันที่เริ่มต้นจำเป็นต้องระบุ");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("วันที่สิ้นสุดจำเป็นต้องระบุ")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("URL รูปภาพต้องไม่เกิน 500 ตัวอักษร")
            .When(x => x.ImageUrl != null);

        RuleFor(x => x.TargetUrl)
            .MaximumLength(500).WithMessage("URL เป้าหมายต้องไม่เกิน 500 ตัวอักษร")
            .When(x => x.TargetUrl != null);

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("ชื่อโฆษณาต้องไม่เกิน 200 ตัวอักษร")
            .When(x => x.Title != null);

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0).WithMessage("ลำดับความสำคัญต้องมากกว่าหรือเท่ากับ 0");
    }

    private bool BeValidAdType(string adType)
    {
        return adType.ToLower() is "banner" or "sponsored" or "featured";
    }
}

public class AdUpdateDtoValidator : AbstractValidator<AdUpdateDto>
{
    public AdUpdateDtoValidator()
    {
        RuleFor(x => x.AdType)
            .Must(BeValidAdType).WithMessage("ประเภทโฆษณาไม่ถูกต้อง (banner, sponsored, featured)")
            .When(x => x.AdType != null);

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate!.Value).WithMessage("วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("URL รูปภาพต้องไม่เกิน 500 ตัวอักษร")
            .When(x => x.ImageUrl != null);

        RuleFor(x => x.TargetUrl)
            .MaximumLength(500).WithMessage("URL เป้าหมายต้องไม่เกิน 500 ตัวอักษร")
            .When(x => x.TargetUrl != null);

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("ชื่อโฆษณาต้องไม่เกิน 200 ตัวอักษร")
            .When(x => x.Title != null);

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0).WithMessage("ลำดับความสำคัญต้องมากกว่าหรือเท่ากับ 0")
            .When(x => x.Priority.HasValue);
    }

    private bool BeValidAdType(string? adType)
    {
        if (adType == null) return true;
        return adType.ToLower() is "banner" or "sponsored" or "featured";
    }
}
