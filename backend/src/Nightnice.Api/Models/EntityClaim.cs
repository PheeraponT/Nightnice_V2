namespace Nightnice.Api.Models;

public class EntityClaim
{
    public Guid Id { get; set; }
    public ManagedEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public Guid RequestedByUserId { get; set; }
    public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
    public string? EvidenceUrl { get; set; }
    public string? Notes { get; set; }
    public Guid? ReviewedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    public User RequestedBy { get; set; } = null!;
}
