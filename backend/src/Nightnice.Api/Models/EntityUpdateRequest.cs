namespace Nightnice.Api.Models;

public class EntityUpdateRequest
{
    public Guid Id { get; set; }
    public ManagedEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public Guid SubmittedByUserId { get; set; }
    public UpdateRequestStatus Status { get; set; } = UpdateRequestStatus.Pending;
    public string PayloadJson { get; set; } = string.Empty;
    public string? ProofMediaUrl { get; set; }
    public string? ExternalProofUrl { get; set; }
    public Guid? ReviewedByAdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
}
