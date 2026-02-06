using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

public class OwnerStoreUpdateDtoValidator : AbstractValidator<OwnerStoreUpdateDto>
{
    public OwnerStoreUpdateDtoValidator()
    {
        RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description != null);
        RuleFor(x => x.Phone).MaximumLength(20).When(x => x.Phone != null);
        RuleFor(x => x.Address).MaximumLength(500).When(x => x.Address != null);
        RuleFor(x => x.PriceRange).InclusiveBetween((short)1, (short)4).When(x => x.PriceRange.HasValue);
        RuleFor(x => x.OpenTime).Matches(@"^\d{2}:\d{2}$").When(x => !string.IsNullOrEmpty(x.OpenTime));
        RuleFor(x => x.CloseTime).Matches(@"^\d{2}:\d{2}$").When(x => !string.IsNullOrEmpty(x.CloseTime));
        RuleFor(x => x.GoogleMapUrl).MaximumLength(500).When(x => x.GoogleMapUrl != null);
        RuleFor(x => x.FacebookUrl).MaximumLength(500).When(x => x.FacebookUrl != null);
        RuleFor(x => x.InstagramUrl).MaximumLength(500).When(x => x.InstagramUrl != null);
        RuleFor(x => x.LineId).MaximumLength(100).When(x => x.LineId != null);
    }
}

public class OwnerReviewReplyDtoValidator : AbstractValidator<OwnerReviewReplyDto>
{
    public OwnerReviewReplyDtoValidator()
    {
        RuleFor(x => x.Reply).NotEmpty().MaximumLength(2000);
    }
}
