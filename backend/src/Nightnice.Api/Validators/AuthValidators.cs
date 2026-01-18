using FluentValidation;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Validators;

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MaximumLength(100).WithMessage("Username cannot exceed 100 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters");
    }
}

public class RefreshTokenDtoValidator : AbstractValidator<RefreshTokenDto>
{
    public RefreshTokenDtoValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required");
    }
}
