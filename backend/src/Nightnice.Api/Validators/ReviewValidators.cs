using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

public class ReviewCreateDtoValidator : AbstractValidator<ReviewCreateDto>
{
    public ReviewCreateDtoValidator()
    {
        RuleFor(x => x.StoreId)
            .NotEmpty().WithMessage("Store ID is required");

        RuleFor(x => x.Rating)
            .InclusiveBetween((short)1, (short)5)
            .WithMessage("Rating must be between 1 and 5");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Review content is required")
            .MinimumLength(10).WithMessage("Review must be at least 10 characters")
            .MaximumLength(2000).WithMessage("Review cannot exceed 2000 characters");
    }
}

public class ReviewUpdateDtoValidator : AbstractValidator<ReviewUpdateDto>
{
    public ReviewUpdateDtoValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween((short)1, (short)5)
            .WithMessage("Rating must be between 1 and 5");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Review content is required")
            .MinimumLength(10).WithMessage("Review must be at least 10 characters")
            .MaximumLength(2000).WithMessage("Review cannot exceed 2000 characters");
    }
}

public class ReviewReportDtoValidator : AbstractValidator<ReviewReportDto>
{
    private static readonly string[] ValidReasons = { "spam", "offensive", "fake", "inappropriate", "other" };

    public ReviewReportDtoValidator()
    {
        RuleFor(x => x.ReviewId)
            .NotEmpty().WithMessage("Review ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required")
            .Must(r => ValidReasons.Contains(r))
            .WithMessage($"Reason must be one of: {string.Join(", ", ValidReasons)}");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
