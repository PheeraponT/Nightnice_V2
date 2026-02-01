using Microsoft.AspNetCore.Mvc;
using Nightnice.Api.DTOs;
using Nightnice.Api.Services;

namespace Nightnice.Api.Endpoints;

public static class EventEndpoints
{
    public static void MapEventEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/events")
            .WithTags("Events")
            .WithOpenApi();

        group.MapGet("", GetEvents)
            .WithName("GetEvents")
            .WithSummary("Search and filter events")
            .WithDescription("Returns a paginated list of events with optional filtering by province, event type, date range, and search query.");

        group.MapGet("/upcoming", GetUpcomingEvents)
            .WithName("GetUpcomingEvents")
            .WithSummary("Get upcoming events")
            .WithDescription("Returns a list of upcoming events.");

        group.MapGet("/featured", GetFeaturedEvents)
            .WithName("GetFeaturedEvents")
            .WithSummary("Get featured events")
            .WithDescription("Returns a list of featured events for the homepage.");

        group.MapGet("/calendar", GetCalendarEvents)
            .WithName("GetCalendarEvents")
            .WithSummary("Get events for calendar view")
            .WithDescription("Returns events for a specific month for calendar display.");

        group.MapGet("/store/{storeSlug}", GetStoreEvents)
            .WithName("GetStoreEvents")
            .WithSummary("Get events by store")
            .WithDescription("Returns events for a specific store.");

        group.MapGet("/{slug}", GetEventBySlug)
            .WithName("GetEventBySlug")
            .WithSummary("Get event details")
            .WithDescription("Returns detailed information about a specific event by its slug.");
    }

    private static async Task<IResult> GetEvents(
        EventService eventService,
        [FromQuery] string? q = null,
        [FromQuery] string? province = null,
        [FromQuery] string? eventType = null,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] bool? featured = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var searchParams = new EventSearchParams(
            Query: q,
            ProvinceSlug: province,
            EventType: eventType,
            StartDate: startDate,
            EndDate: endDate,
            IsFeatured: featured,
            Page: page,
            PageSize: pageSize
        );

        var result = await eventService.SearchEventsAsync(searchParams);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetUpcomingEvents(
        EventService eventService,
        [FromQuery] string? province = null,
        [FromQuery] string? eventType = null,
        [FromQuery] int limit = 12)
    {
        var events = await eventService.GetUpcomingEventsAsync(province, eventType, limit);
        return Results.Ok(events);
    }

    private static async Task<IResult> GetFeaturedEvents(
        EventService eventService,
        [FromQuery] int limit = 6)
    {
        var events = await eventService.GetFeaturedEventsAsync(limit);
        return Results.Ok(events);
    }

    private static async Task<IResult> GetCalendarEvents(
        EventService eventService,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] string? province = null)
    {
        var now = DateTime.UtcNow;
        var y = year ?? now.Year;
        var m = month ?? now.Month;

        var events = await eventService.GetCalendarEventsAsync(y, m, province);
        return Results.Ok(events);
    }

    private static async Task<IResult> GetStoreEvents(
        EventService eventService,
        string storeSlug,
        [FromQuery] bool upcoming = true,
        [FromQuery] int limit = 10)
    {
        var events = await eventService.GetStoreEventsAsync(storeSlug, upcoming, limit);
        return Results.Ok(events);
    }

    private static async Task<IResult> GetEventBySlug(
        EventService eventService,
        string slug)
    {
        var evt = await eventService.GetEventBySlugAsync(slug);

        if (evt == null)
            return Results.NotFound(new { message = "Event not found" });

        return Results.Ok(evt);
    }
}
