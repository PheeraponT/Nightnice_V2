namespace Nightnice.Api.Models;

public class UserFavoriteStore
{
    public Guid UserId { get; set; }
    public Guid StoreId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Store Store { get; set; } = null!;
}
