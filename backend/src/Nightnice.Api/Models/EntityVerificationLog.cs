namespace Nightnice.Api.Models;

public class EntityVerificationLog
{
    public Guid Id { get; set; }
    public ManagedEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
