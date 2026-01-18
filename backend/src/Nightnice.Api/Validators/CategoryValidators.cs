using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

// T129: Category validators
public class CategoryCreateDtoValidator : AbstractValidator<CategoryCreateDto>
{
    public CategoryCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("ชื่อประเภทร้านจำเป็นต้องระบุ")
            .MaximumLength(100).WithMessage("ชื่อประเภทร้านต้องไม่เกิน 100 ตัวอักษร");

        RuleFor(x => x.IconEmoji)
            .MaximumLength(10).WithMessage("Emoji ต้องไม่เกิน 10 ตัวอักษร")
            .When(x => x.IconEmoji != null);

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0).WithMessage("ลำดับต้องมากกว่าหรือเท่ากับ 0")
            .When(x => x.SortOrder.HasValue);
    }
}

public class CategoryUpdateDtoValidator : AbstractValidator<CategoryUpdateDto>
{
    public CategoryUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("ชื่อประเภทร้านจำเป็นต้องระบุ")
            .MaximumLength(100).WithMessage("ชื่อประเภทร้านต้องไม่เกิน 100 ตัวอักษร")
            .When(x => x.Name != null);

        RuleFor(x => x.IconEmoji)
            .MaximumLength(10).WithMessage("Emoji ต้องไม่เกิน 10 ตัวอักษร")
            .When(x => x.IconEmoji != null);

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0).WithMessage("ลำดับต้องมากกว่าหรือเท่ากับ 0")
            .When(x => x.SortOrder.HasValue);
    }
}
