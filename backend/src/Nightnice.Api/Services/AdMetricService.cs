using Nightnice.Api.Data;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

// T101: Ad metric service for batch insert of ad events
public class AdMetricService
{
    private readonly NightniceDbContext _context;
    private readonly ILogger<AdMetricService> _logger;

    public AdMetricService(NightniceDbContext context, ILogger<AdMetricService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> BatchInsertMetricsAsync(IEnumerable<AdTrackingDto> events)
    {
        try
        {
            var metrics = events.Select(e => new AdMetric
            {
                Id = Guid.NewGuid(),
                AdId = e.AdId,
                EventType = e.EventType == "impression" ? AdEventType.Impression : AdEventType.Click,
                PageContext = e.PageUrl,
                CreatedAt = DateTime.UtcNow
            });

            await _context.AdMetrics.AddRangeAsync(metrics);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Batch inserted {Count} ad metrics", events.Count());
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error batch inserting ad metrics");
            return false;
        }
    }
}
