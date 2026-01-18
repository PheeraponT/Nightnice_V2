using Nightnice.Api.Data.Repositories;
using Nightnice.Api.DTOs;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

// T098 & T110: Ad service with targeting, filtering, and expired ads handling
public class AdService
{
    private readonly AdRepository _adRepository;
    private readonly ILogger<AdService> _logger;

    public AdService(AdRepository adRepository, ILogger<AdService> logger)
    {
        _adRepository = adRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<AdListDto>> GetTargetedAdsAsync(AdTargetingParams? targeting = null)
    {
        // T110: Expired ads are already filtered in repository (EndDate >= today)
        var params_ = targeting ?? new AdTargetingParams();

        // Validate limit
        var validatedParams = params_ with
        {
            Limit = Math.Clamp(params_.Limit, 1, 20)
        };

        try
        {
            return await _adRepository.GetTargetedAdsAsync(validatedParams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching targeted ads");
            return Enumerable.Empty<AdListDto>();
        }
    }

    public async Task<AdTrackingResponse> TrackEventAsync(AdTrackingDto tracking)
    {
        try
        {
            // Validate event type
            if (tracking.EventType != "impression" && tracking.EventType != "click")
            {
                return new AdTrackingResponse(false, "Invalid event type");
            }

            // Verify ad exists
            var ad = await _adRepository.GetByIdAsync(tracking.AdId);
            if (ad == null)
            {
                return new AdTrackingResponse(false, "Ad not found");
            }

            // Record metric
            var eventType = tracking.EventType == "impression"
                ? AdEventType.Impression
                : AdEventType.Click;

            await _adRepository.RecordMetricAsync(tracking.AdId, eventType, tracking.PageUrl);

            _logger.LogDebug("Ad {EventType} tracked for {AdId}", tracking.EventType, tracking.AdId);

            return new AdTrackingResponse(true, "Event tracked");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking ad event for {AdId}", tracking.AdId);
            return new AdTrackingResponse(false, "Error tracking event");
        }
    }
}
