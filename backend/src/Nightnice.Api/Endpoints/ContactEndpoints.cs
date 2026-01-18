using Nightnice.Api.DTOs;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

// T090: Contact endpoints for advertise page
public static class ContactEndpoints
{
    public static void MapContactEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/contact")
            .WithTags("Contact")
            .WithOpenApi();

        group.MapPost("", SubmitInquiry)
            .WithName("SubmitContactInquiry")
            .WithSummary("Submit a contact inquiry")
            .WithDescription("Submits a contact inquiry for advertising or general questions.");
    }

    private static async Task<IResult> SubmitInquiry(
        ContactService contactService,
        ContactInquiryDto inquiry)
    {
        var response = await contactService.SubmitInquiryAsync(inquiry);

        if (response.Success)
            return Results.Ok(response);

        return Results.BadRequest(response);
    }
}
