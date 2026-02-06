using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class EventRepository
{
    private readonly NightniceDbContext _context;

    public EventRepository(NightniceDbContext context)
    {
        _context = context;
    }

    #region Public Methods

    /// <summary>
    /// Search events with filtering and pagination
    /// </summary>
    public async Task<PaginatedResult<EventListDto>> SearchAsync(EventSearchParams searchParams)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.IsActive)
            .AsQueryable();

        // Filter by search query
        if (!string.IsNullOrWhiteSpace(searchParams.Query))
        {
            var searchTerm = searchParams.Query.ToLower();
            query = query.Where(e =>
                e.Title.ToLower().Contains(searchTerm) ||
                (e.Description != null && e.Description.ToLower().Contains(searchTerm)) ||
                e.Store.Name.ToLower().Contains(searchTerm));
        }

        // Filter by province
        if (!string.IsNullOrWhiteSpace(searchParams.ProvinceSlug))
        {
            query = query.Where(e => e.Store.Province != null && e.Store.Province.Slug == searchParams.ProvinceSlug);
        }

        // Filter by event type
        if (!string.IsNullOrWhiteSpace(searchParams.EventType))
        {
            if (Enum.TryParse<EventType>(searchParams.EventType, true, out var eventType))
            {
                query = query.Where(e => e.EventType == eventType);
            }
        }

        // Filter by date range
        if (searchParams.StartDate.HasValue)
        {
            query = query.Where(e => e.StartDate >= searchParams.StartDate.Value ||
                                     (e.EndDate.HasValue && e.EndDate.Value >= searchParams.StartDate.Value));
        }

        if (searchParams.EndDate.HasValue)
        {
            query = query.Where(e => e.StartDate <= searchParams.EndDate.Value);
        }

        // Filter by featured
        if (searchParams.IsFeatured.HasValue)
        {
            query = query.Where(e => e.IsFeatured == searchParams.IsFeatured.Value);
        }

        // Filter by store
        if (searchParams.StoreId.HasValue)
        {
            query = query.Where(e => e.StoreId == searchParams.StoreId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(e => e.StartDate)
            .ThenBy(e => e.StartTime)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(e => new EventListDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.ImageUrl,
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.EndTime != null ? e.EndTime.Value.ToString("HH:mm") : null,
                e.Price,
                e.PriceMax,
                e.IsFeatured,
                e.StoreId,
                e.Store.Name,
                e.Store.Slug,
                e.Store.LogoUrl,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.Store.Province != null ? e.Store.Province.Slug : null
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / searchParams.PageSize);

        return new PaginatedResult<EventListDto>(
            items,
            totalCount,
            searchParams.Page,
            searchParams.PageSize,
            totalPages
        );
    }

    /// <summary>
    /// Get upcoming events (future events)
    /// </summary>
    public async Task<IEnumerable<EventListDto>> GetUpcomingAsync(string? provinceSlug = null, string? eventType = null, int limit = 12)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.IsActive && (e.StartDate >= today || (e.EndDate.HasValue && e.EndDate.Value >= today)))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(provinceSlug))
        {
            query = query.Where(e => e.Store.Province != null && e.Store.Province.Slug == provinceSlug);
        }

        if (!string.IsNullOrWhiteSpace(eventType) && Enum.TryParse<EventType>(eventType, true, out var type))
        {
            query = query.Where(e => e.EventType == type);
        }

        return await query
            .OrderBy(e => e.StartDate)
            .ThenBy(e => e.StartTime)
            .Take(limit)
            .Select(e => new EventListDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.ImageUrl,
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.EndTime != null ? e.EndTime.Value.ToString("HH:mm") : null,
                e.Price,
                e.PriceMax,
                e.IsFeatured,
                e.StoreId,
                e.Store.Name,
                e.Store.Slug,
                e.Store.LogoUrl,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.Store.Province != null ? e.Store.Province.Slug : null
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Get featured events
    /// </summary>
    public async Task<IEnumerable<EventListDto>> GetFeaturedAsync(int limit = 6)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return await _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.IsActive && e.IsFeatured && (e.StartDate >= today || (e.EndDate.HasValue && e.EndDate.Value >= today)))
            .OrderBy(e => e.StartDate)
            .ThenBy(e => e.StartTime)
            .Take(limit)
            .Select(e => new EventListDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.ImageUrl,
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.EndTime != null ? e.EndTime.Value.ToString("HH:mm") : null,
                e.Price,
                e.PriceMax,
                e.IsFeatured,
                e.StoreId,
                e.Store.Name,
                e.Store.Slug,
                e.Store.LogoUrl,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.Store.Province != null ? e.Store.Province.Slug : null
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Get events for calendar view (by month)
    /// </summary>
    public async Task<IEnumerable<EventCalendarDto>> GetCalendarEventsAsync(int year, int month, string? provinceSlug = null)
    {
        var startDate = new DateOnly(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var query = _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.IsActive &&
                       ((e.StartDate >= startDate && e.StartDate <= endDate) ||
                        (e.EndDate.HasValue && e.EndDate.Value >= startDate && e.StartDate <= endDate)))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(provinceSlug))
        {
            query = query.Where(e => e.Store.Province != null && e.Store.Province.Slug == provinceSlug);
        }

        return await query
            .OrderBy(e => e.StartDate)
            .ThenBy(e => e.StartTime)
            .Select(e => new EventCalendarDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.Store.Name,
                e.Store.Slug,
                e.Store.Province != null ? e.Store.Province.Slug : null
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Get event by slug (public)
    /// </summary>
    public async Task<EventDetailDto?> GetBySlugAsync(string slug)
    {
        var evt = await _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
                    .ThenInclude(p => p!.Region)
            .Where(e => e.Slug == slug && e.IsActive)
            .FirstOrDefaultAsync();

        if (evt == null)
            return null;

        return new EventDetailDto(
            evt.Id,
            evt.Title,
            evt.Slug,
            evt.EventType.ToString(),
            evt.Description,
            evt.ImageUrl,
            evt.StartDate,
            evt.EndDate,
            evt.StartTime?.ToString("HH:mm"),
            evt.EndTime?.ToString("HH:mm"),
            evt.Price,
            evt.PriceMax,
            evt.TicketUrl,
            evt.IsRecurring,
            evt.RecurrencePattern,
            evt.IsFeatured,
            evt.CreatedAt,
            evt.StoreId,
            evt.Store.Name,
            evt.Store.Slug,
            evt.Store.LogoUrl,
            evt.Store.Phone,
            evt.Store.LineId,
            evt.Store.Province?.Name,
            evt.Store.Province?.Slug,
            evt.Store.Province?.Region?.Name,
            evt.Store.Latitude,
            evt.Store.Longitude,
            evt.Store.GoogleMapUrl
        );
    }

    /// <summary>
    /// Get events by store slug (public)
    /// </summary>
    public async Task<IEnumerable<EventListDto>> GetByStoreSlugAsync(string storeSlug, bool upcomingOnly = true, int limit = 10)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.IsActive && e.Store.Slug == storeSlug)
            .AsQueryable();

        if (upcomingOnly)
        {
            query = query.Where(e => e.StartDate >= today || (e.EndDate.HasValue && e.EndDate.Value >= today));
        }

        return await query
            .OrderBy(e => e.StartDate)
            .ThenBy(e => e.StartTime)
            .Take(limit)
            .Select(e => new EventListDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.ImageUrl,
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.EndTime != null ? e.EndTime.Value.ToString("HH:mm") : null,
                e.Price,
                e.PriceMax,
                e.IsFeatured,
                e.StoreId,
                e.Store.Name,
                e.Store.Slug,
                e.Store.LogoUrl,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.Store.Province != null ? e.Store.Province.Slug : null
            ))
            .ToListAsync();
    }

    #endregion

    #region Admin Methods

    /// <summary>
    /// Get admin events list with filtering
    /// </summary>
    public async Task<PaginatedResult<AdminEventListDto>> GetAdminEventsAsync(EventSearchParams searchParams)
    {
        var query = _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .AsQueryable();

        // Filter by search query
        if (!string.IsNullOrWhiteSpace(searchParams.Query))
        {
            var searchTerm = searchParams.Query.ToLower();
            query = query.Where(e =>
                e.Title.ToLower().Contains(searchTerm) ||
                e.Store.Name.ToLower().Contains(searchTerm));
        }

        // Filter by store
        if (searchParams.StoreId.HasValue)
        {
            query = query.Where(e => e.StoreId == searchParams.StoreId.Value);
        }

        // Filter by event type
        if (!string.IsNullOrWhiteSpace(searchParams.EventType))
        {
            if (Enum.TryParse<EventType>(searchParams.EventType, true, out var eventType))
            {
                query = query.Where(e => e.EventType == eventType);
            }
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((searchParams.Page - 1) * searchParams.PageSize)
            .Take(searchParams.PageSize)
            .Select(e => new AdminEventListDto(
                e.Id,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.Store.Name,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.StartDate,
                e.EndDate,
                e.IsActive,
                e.IsFeatured,
                e.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)totalCount / searchParams.PageSize);

        return new PaginatedResult<AdminEventListDto>(
            items,
            totalCount,
            searchParams.Page,
            searchParams.PageSize,
            totalPages
        );
    }

    /// <summary>
    /// Get admin event by ID
    /// </summary>
    public async Task<AdminEventDto?> GetAdminEventByIdAsync(Guid id)
    {
        return await _context.Events
            .Include(e => e.Store)
                .ThenInclude(s => s.Province)
            .Where(e => e.Id == id)
            .Select(e => new AdminEventDto(
                e.Id,
                e.StoreId,
                e.Store.Name,
                e.Store.Province != null ? e.Store.Province.Name : null,
                e.Title,
                e.Slug,
                e.EventType.ToString(),
                e.Description,
                e.ImageUrl,
                e.StartDate,
                e.EndDate,
                e.StartTime != null ? e.StartTime.Value.ToString("HH:mm") : null,
                e.EndTime != null ? e.EndTime.Value.ToString("HH:mm") : null,
                e.Price,
                e.PriceMax,
                e.TicketUrl,
                e.IsRecurring,
                e.RecurrencePattern,
                e.IsActive,
                e.IsFeatured,
                e.CreatedAt,
                e.UpdatedAt
            ))
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Create new event
    /// </summary>
    public async Task<AdminEventDto> CreateAsync(EventCreateDto createDto)
    {
        var slug = GenerateSlug(createDto.Title);

        // Ensure unique slug
        var baseSlug = slug;
        var counter = 1;
        while (await _context.Events.AnyAsync(e => e.Slug == slug))
        {
            slug = $"{baseSlug}-{counter++}";
        }

        if (!Enum.TryParse<EventType>(createDto.EventType, true, out var eventType))
        {
            eventType = EventType.Other;
        }

        var evt = new Event
        {
            Id = Guid.NewGuid(),
            StoreId = createDto.StoreId,
            EventType = eventType,
            Title = createDto.Title,
            Slug = slug,
            Description = createDto.Description,
            ImageUrl = createDto.ImageUrl,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            StartTime = ParseTime(createDto.StartTime),
            EndTime = ParseTime(createDto.EndTime),
            Price = createDto.Price,
            PriceMax = createDto.PriceMax,
            TicketUrl = createDto.TicketUrl,
            IsRecurring = createDto.IsRecurring,
            RecurrencePattern = createDto.RecurrencePattern,
            IsActive = createDto.IsActive,
            IsFeatured = createDto.IsFeatured,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Events.Add(evt);
        await _context.SaveChangesAsync();

        return (await GetAdminEventByIdAsync(evt.Id))!;
    }

    /// <summary>
    /// Update event
    /// </summary>
    public async Task<AdminEventDto?> UpdateAsync(Guid id, EventUpdateDto updateDto)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null)
            return null;

        if (updateDto.StoreId.HasValue)
            evt.StoreId = updateDto.StoreId.Value;

        if (updateDto.Title != null)
        {
            evt.Title = updateDto.Title;
            evt.Slug = GenerateSlug(updateDto.Title);
            // Ensure unique slug
            var baseSlug = evt.Slug;
            var counter = 1;
            while (await _context.Events.AnyAsync(e => e.Slug == evt.Slug && e.Id != id))
            {
                evt.Slug = $"{baseSlug}-{counter++}";
            }
        }

        if (updateDto.EventType != null && Enum.TryParse<EventType>(updateDto.EventType, true, out var eventType))
            evt.EventType = eventType;

        if (updateDto.Description != null)
            evt.Description = updateDto.Description;

        if (updateDto.ImageUrl != null)
            evt.ImageUrl = updateDto.ImageUrl;

        if (updateDto.StartDate.HasValue)
            evt.StartDate = updateDto.StartDate.Value;

        if (updateDto.EndDate.HasValue)
            evt.EndDate = updateDto.EndDate.Value;

        if (updateDto.StartTime != null)
            evt.StartTime = ParseTime(updateDto.StartTime);

        if (updateDto.EndTime != null)
            evt.EndTime = ParseTime(updateDto.EndTime);

        if (updateDto.Price.HasValue)
            evt.Price = updateDto.Price.Value;

        if (updateDto.PriceMax.HasValue)
            evt.PriceMax = updateDto.PriceMax.Value;

        if (updateDto.TicketUrl != null)
            evt.TicketUrl = updateDto.TicketUrl;

        if (updateDto.IsRecurring.HasValue)
            evt.IsRecurring = updateDto.IsRecurring.Value;

        if (updateDto.RecurrencePattern != null)
            evt.RecurrencePattern = updateDto.RecurrencePattern;

        if (updateDto.IsActive.HasValue)
            evt.IsActive = updateDto.IsActive.Value;

        if (updateDto.IsFeatured.HasValue)
            evt.IsFeatured = updateDto.IsFeatured.Value;

        evt.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetAdminEventByIdAsync(id);
    }

    /// <summary>
    /// Delete event
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null)
            return false;

        _context.Events.Remove(evt);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Guid?> ResolveEventIdBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        var normalized = slug.Trim().ToLower();
        return await _context.Events
            .Where(e => e.Slug == normalized)
            .Select(e => (Guid?)e.Id)
            .FirstOrDefaultAsync();
    }

    #endregion

    #region Helper Methods

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");

        // Remove non-alphanumeric characters except hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");

        return slug.Trim('-');
    }

    private static TimeOnly? ParseTime(string? timeStr)
    {
        if (string.IsNullOrEmpty(timeStr))
            return null;

        if (TimeOnly.TryParse(timeStr, out var time))
            return time;

        return null;
    }

    #endregion
}
