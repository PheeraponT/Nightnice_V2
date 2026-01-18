using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

// T114: Validators for store create and update DTOs
public class StoreCreateDtoValidator : AbstractValidator<StoreCreateDto>
{
    public StoreCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Store name is required")
            .MaximumLength(200).WithMessage("Store name cannot exceed 200 characters");

        RuleFor(x => x.ProvinceId)
            .NotEmpty().WithMessage("Province is required");

        RuleFor(x => x.CategoryIds)
            .NotEmpty().WithMessage("At least one category is required");

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone cannot exceed 20 characters")
            .Matches(@"^[0-9\-+() ]+$").WithMessage("Invalid phone format")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90")
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180")
            .When(x => x.Longitude.HasValue);

        RuleFor(x => x.PriceRange)
            .InclusiveBetween((short)1, (short)4).WithMessage("Price range must be between 1 and 4")
            .When(x => x.PriceRange.HasValue);

        RuleFor(x => x.OpenTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Open time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.OpenTime));

        RuleFor(x => x.CloseTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Close time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.CloseTime));

        RuleFor(x => x.LogoUrl)
            .MaximumLength(500).WithMessage("Logo URL cannot exceed 500 characters")
            .When(x => x.LogoUrl != null);

        RuleFor(x => x.BannerUrl)
            .MaximumLength(500).WithMessage("Banner URL cannot exceed 500 characters")
            .When(x => x.BannerUrl != null);

        RuleFor(x => x.GoogleMapUrl)
            .MaximumLength(500).WithMessage("Google Map URL cannot exceed 500 characters")
            .When(x => x.GoogleMapUrl != null);

        RuleFor(x => x.FacebookUrl)
            .MaximumLength(500).WithMessage("Facebook URL cannot exceed 500 characters")
            .When(x => x.FacebookUrl != null);

        RuleFor(x => x.InstagramUrl)
            .MaximumLength(500).WithMessage("Instagram URL cannot exceed 500 characters")
            .When(x => x.InstagramUrl != null);
    }
}

public class StoreUpdateDtoValidator : AbstractValidator<StoreUpdateDto>
{
    public StoreUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Store name cannot exceed 200 characters")
            .When(x => x.Name != null);

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone cannot exceed 20 characters")
            .Matches(@"^[0-9\-+() ]+$").WithMessage("Invalid phone format")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90")
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180")
            .When(x => x.Longitude.HasValue);

        RuleFor(x => x.PriceRange)
            .InclusiveBetween((short)1, (short)4).WithMessage("Price range must be between 1 and 4")
            .When(x => x.PriceRange.HasValue);

        RuleFor(x => x.OpenTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Open time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.OpenTime));

        RuleFor(x => x.CloseTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Close time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.CloseTime));

        RuleFor(x => x.LogoUrl)
            .MaximumLength(500).WithMessage("Logo URL cannot exceed 500 characters")
            .When(x => x.LogoUrl != null);

        RuleFor(x => x.BannerUrl)
            .MaximumLength(500).WithMessage("Banner URL cannot exceed 500 characters")
            .When(x => x.BannerUrl != null);

        RuleFor(x => x.GoogleMapUrl)
            .MaximumLength(500).WithMessage("Google Map URL cannot exceed 500 characters")
            .When(x => x.GoogleMapUrl != null);

        RuleFor(x => x.FacebookUrl)
            .MaximumLength(500).WithMessage("Facebook URL cannot exceed 500 characters")
            .When(x => x.FacebookUrl != null);

        RuleFor(x => x.InstagramUrl)
            .MaximumLength(500).WithMessage("Instagram URL cannot exceed 500 characters")
            .When(x => x.InstagramUrl != null);
    }
}
