using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;

namespace Nightnice.Api.Services;

public class EventService
{
    private readonly EventRepository _eventRepository;

    public EventService(EventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    #region Public Methods

    public async Task<PaginatedResult<EventListDto>> SearchEventsAsync(EventSearchParams searchParams)
    {
        var validatedParams = searchParams with
        {
            Page = Math.Max(1, searchParams.Page),
            PageSize = Math.Clamp(searchParams.PageSize, 1, 50)
        };

        return await _eventRepository.SearchAsync(validatedParams);
    }

    public async Task<IEnumerable<EventListDto>> GetUpcomingEventsAsync(string? provinceSlug = null, string? eventType = null, int limit = 12)
    {
        return await _eventRepository.GetUpcomingAsync(provinceSlug, eventType, Math.Clamp(limit, 1, 50));
    }

    public async Task<IEnumerable<EventListDto>> GetFeaturedEventsAsync(int limit = 6)
    {
        return await _eventRepository.GetFeaturedAsync(Math.Clamp(limit, 1, 20));
    }

    public async Task<IEnumerable<EventCalendarDto>> GetCalendarEventsAsync(int year, int month, string? provinceSlug = null)
    {
        // Validate year and month
        if (year < 2020 || year > 2100)
            year = DateTime.UtcNow.Year;
        if (month < 1 || month > 12)
            month = DateTime.UtcNow.Month;

        return await _eventRepository.GetCalendarEventsAsync(year, month, provinceSlug);
    }

    public async Task<EventDetailDto?> GetEventBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return null;

        return await _eventRepository.GetBySlugAsync(slug.Trim().ToLower());
    }

    public async Task<IEnumerable<EventListDto>> GetStoreEventsAsync(string storeSlug, bool upcomingOnly = true, int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(storeSlug))
            return Enumerable.Empty<EventListDto>();

        return await _eventRepository.GetByStoreSlugAsync(storeSlug.Trim().ToLower(), upcomingOnly, Math.Clamp(limit, 1, 50));
    }

    #endregion

    #region Admin Methods

    public async Task<PaginatedResult<AdminEventListDto>> GetAdminEventsAsync(EventSearchParams searchParams)
    {
        var validatedParams = searchParams with
        {
            Page = Math.Max(1, searchParams.Page),
            PageSize = Math.Clamp(searchParams.PageSize, 1, 100)
        };

        return await _eventRepository.GetAdminEventsAsync(validatedParams);
    }

    public async Task<AdminEventDto?> GetAdminEventByIdAsync(Guid id)
    {
        return await _eventRepository.GetAdminEventByIdAsync(id);
    }

    public async Task<AdminEventDto> CreateEventAsync(EventCreateDto createDto)
    {
        return await _eventRepository.CreateAsync(createDto);
    }

    public async Task<AdminEventDto?> UpdateEventAsync(Guid id, EventUpdateDto updateDto)
    {
        return await _eventRepository.UpdateAsync(id, updateDto);
    }

    public async Task<bool> DeleteEventAsync(Guid id)
    {
        return await _eventRepository.DeleteAsync(id);
    }

    public Task<Guid?> ResolveEventIdBySlugAsync(string slug)
    {
        return _eventRepository.ResolveEventIdBySlugAsync(slug);
    }

    #endregion
}
