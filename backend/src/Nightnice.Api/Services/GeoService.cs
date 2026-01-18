namespace Nightnice.Api.Services;

/// <summary>
/// T081: Geographic calculation service for nearby store functionality
/// </summary>
public static class GeoService
{
    private const double EarthRadiusKm = 6371.0;

    /// <summary>
    /// Calculate the distance between two geographic coordinates using the Haversine formula
    /// </summary>
    /// <param name="lat1">Latitude of point 1</param>
    /// <param name="lon1">Longitude of point 1</param>
    /// <param name="lat2">Latitude of point 2</param>
    /// <param name="lon2">Longitude of point 2</param>
    /// <returns>Distance in kilometers</returns>
    public static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
}
