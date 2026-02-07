using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

public class CommunityPostCreateValidator : AbstractValidator<CommunityPostCreateDto>
{
    public CommunityPostCreateValidator()
    {
        RuleFor(x => x.StoreId).NotEmpty();
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("ต้องใส่หัวข้อโพสต์")
            .MaximumLength(200);
        RuleFor(x => x.Summary)
            .MaximumLength(600)
            .When(x => !string.IsNullOrWhiteSpace(x.Summary));
        RuleFor(x => x.Story)
            .MaximumLength(6000)
            .When(x => !string.IsNullOrWhiteSpace(x.Story));
        RuleFor(x => x.MoodId)
            .NotEmpty()
            .MaximumLength(40);
        RuleFor(x => x.MoodMatch)
            .InclusiveBetween((short)0, (short)100)
            .When(x => x.MoodMatch.HasValue);
        RuleFor(x => x.VibeTags)
            .Must(tags => tags == null || tags.Distinct(StringComparer.OrdinalIgnoreCase).Count() == tags.Count())
            .WithMessage("ห้ามมี vibe tag ซ้ำกัน")
            .Must(tags => tags == null || tags.Count() <= 5)
            .WithMessage("vibe tag ได้ไม่เกิน 5 รายการ");
        RuleForEach(x => x.VibeTags)
            .MaximumLength(40);

        RuleFor(x => x.Images)
            .NotEmpty().WithMessage("ต้องใส่รูปอย่างน้อย 1 รูป")
            .Must(images => images.Count() <= 3).WithMessage("อนุญาตสูงสุด 3 ภาพ");

        RuleForEach(x => x.Images).SetValidator(new CommunityPostImageInputValidator());
    }
}

public class CommunityPostUpdateValidator : AbstractValidator<CommunityPostUpdateDto>
{
    public CommunityPostUpdateValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("ต้องใส่หัวข้อโพสต์")
            .MaximumLength(200);
        RuleFor(x => x.Summary)
            .MaximumLength(600)
            .When(x => !string.IsNullOrWhiteSpace(x.Summary));
        RuleFor(x => x.Story)
            .MaximumLength(6000)
            .When(x => !string.IsNullOrWhiteSpace(x.Story));
        RuleFor(x => x.MoodId)
            .NotEmpty()
            .MaximumLength(40);
        RuleFor(x => x.MoodMatch)
            .InclusiveBetween((short)0, (short)100)
            .When(x => x.MoodMatch.HasValue);
        RuleFor(x => x.VibeTags)
            .Must(tags => tags == null || tags.Distinct(StringComparer.OrdinalIgnoreCase).Count() == tags.Count())
            .WithMessage("ห้ามมี vibe tag ซ้ำกัน")
            .Must(tags => tags == null || tags.Count() <= 5)
            .WithMessage("vibe tag ได้ไม่เกิน 5 รายการ");
        RuleForEach(x => x.VibeTags)
            .MaximumLength(40);

        RuleFor(x => x.Images)
            .NotEmpty().WithMessage("ต้องใส่รูปอย่างน้อย 1 รูป")
            .Must(images => images.Count() <= 3).WithMessage("อนุญาตสูงสุด 3 ภาพ");

        RuleForEach(x => x.Images).SetValidator(new CommunityPostImageInputValidator());
    }
}

public class CommunityPostImageInputValidator : AbstractValidator<CommunityPostImageInputDto>
{
    public CommunityPostImageInputValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty()
            .MaximumLength(500)
            .Must(BeValidUrl).WithMessage("รูปต้องเป็น URL ที่เข้าถึงได้");

        RuleFor(x => x.AltText)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.AltText));
    }

    private static bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out _) ||
               (url.StartsWith("/uploads/") && !url.Contains(".."));
    }
}
