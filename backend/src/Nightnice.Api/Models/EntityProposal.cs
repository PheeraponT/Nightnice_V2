namespace Nightnice.Api.Models;

public class EntityProposal
{
    public Guid Id { get; set; }
    public ManagedEntityType EntityType { get; set; }
    public Guid SubmittedByUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ReferenceUrl { get; set; }
    public string PayloadJson { get; set; } = string.Empty;
    public ProposalStatus Status { get; set; } = ProposalStatus.Pending;
    public Guid? ReviewedByAdminId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    public User SubmittedBy { get; set; } = null!;
}
