using FluentValidation;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Validators;

public class EventCreateDtoValidator : AbstractValidator<EventCreateDto>
{
    public EventCreateDtoValidator()
    {
        RuleFor(x => x.StoreId)
            .NotEmpty().WithMessage("Store is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Event title is required")
            .MaximumLength(300).WithMessage("Event title cannot exceed 300 characters");

        RuleFor(x => x.EventType)
            .NotEmpty().WithMessage("Event type is required")
            .Must(BeValidEventType).WithMessage("Invalid event type");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL cannot exceed 500 characters")
            .When(x => x.ImageUrl != null);

        RuleFor(x => x.TicketUrl)
            .MaximumLength(500).WithMessage("Ticket URL cannot exceed 500 characters")
            .When(x => x.TicketUrl != null);

        RuleFor(x => x.StartTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Start time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.StartTime));

        RuleFor(x => x.EndTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("End time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.EndTime));

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater")
            .When(x => x.Price.HasValue);

        RuleFor(x => x.PriceMax)
            .GreaterThanOrEqualTo(0).WithMessage("Max price must be 0 or greater")
            .When(x => x.PriceMax.HasValue);

        RuleFor(x => x)
            .Must(x => !x.PriceMax.HasValue || !x.Price.HasValue || x.PriceMax >= x.Price)
            .WithMessage("Max price must be greater than or equal to price");

        RuleFor(x => x.EndDate)
            .Must((dto, endDate) => !endDate.HasValue || endDate >= dto.StartDate)
            .WithMessage("End date must be on or after start date")
            .When(x => x.EndDate.HasValue);

        RuleFor(x => x.RecurrencePattern)
            .MaximumLength(500).WithMessage("Recurrence pattern cannot exceed 500 characters")
            .When(x => x.RecurrencePattern != null);
    }

    private bool BeValidEventType(string eventType)
    {
        return Enum.TryParse<EventType>(eventType, true, out _);
    }
}

public class EventUpdateDtoValidator : AbstractValidator<EventUpdateDto>
{
    public EventUpdateDtoValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(300).WithMessage("Event title cannot exceed 300 characters")
            .When(x => x.Title != null);

        RuleFor(x => x.EventType)
            .Must(BeValidEventType).WithMessage("Invalid event type")
            .When(x => x.EventType != null);

        RuleFor(x => x.Description)
            .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL cannot exceed 500 characters")
            .When(x => x.ImageUrl != null);

        RuleFor(x => x.TicketUrl)
            .MaximumLength(500).WithMessage("Ticket URL cannot exceed 500 characters")
            .When(x => x.TicketUrl != null);

        RuleFor(x => x.StartTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("Start time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.StartTime));

        RuleFor(x => x.EndTime)
            .Matches(@"^\d{2}:\d{2}$").WithMessage("End time must be in HH:mm format")
            .When(x => !string.IsNullOrEmpty(x.EndTime));

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater")
            .When(x => x.Price.HasValue);

        RuleFor(x => x.PriceMax)
            .GreaterThanOrEqualTo(0).WithMessage("Max price must be 0 or greater")
            .When(x => x.PriceMax.HasValue);

        RuleFor(x => x.RecurrencePattern)
            .MaximumLength(500).WithMessage("Recurrence pattern cannot exceed 500 characters")
            .When(x => x.RecurrencePattern != null);
    }

    private bool BeValidEventType(string? eventType)
    {
        if (eventType == null) return true;
        return Enum.TryParse<EventType>(eventType, true, out _);
    }
}
