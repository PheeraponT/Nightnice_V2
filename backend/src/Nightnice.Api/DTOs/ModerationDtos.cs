using System.ComponentModel.DataAnnotations;
using Nightnice.Api.Models;

namespace Nightnice.Api.DTOs;

public record EntityClaimRequestDto(
    [Required] ManagedEntityType EntityType,
    [Required, MaxLength(200)] string EntitySlug,
    string? EvidenceUrl,
    [MaxLength(1000)] string? Notes
);

public record EntityUpdateRequestDto(
    [Required] ManagedEntityType EntityType,
    [Required, MaxLength(200)] string EntitySlug,
    Dictionary<string, string> Fields,
    string? ProofMediaUrl,
    string? ExternalProofUrl
);

public record EntityProposalRequestDto(
    [Required] ManagedEntityType EntityType,
    [Required, MaxLength(200)] string Name,
    Dictionary<string, string> Fields,
    string? ReferenceUrl
);

public record ModerationDecisionDto(
    [Required] string Decision,
    string? Notes
);

public record AdminEntityClaimDto(
    Guid Id,
    ManagedEntityType EntityType,
    Guid EntityId,
    string? EntityName,
    string? EntitySlug,
    string RequestedByName,
    string? RequestedByEmail,
    string? EvidenceUrl,
    string? Notes,
    ClaimStatus Status,
    DateTime CreatedAt
);

public record AdminEntityUpdateRequestDto(
    Guid Id,
    ManagedEntityType EntityType,
    Guid EntityId,
    string? EntityName,
    string? EntitySlug,
    string SubmittedByName,
    string? SubmittedByEmail,
    UpdateRequestStatus Status,
    string PayloadJson,
    string? ProofMediaUrl,
    string? ExternalProofUrl,
    DateTime CreatedAt
);

public record AdminEntityProposalDto(
    Guid Id,
    ManagedEntityType EntityType,
    string Name,
    string? ReferenceUrl,
    string PayloadJson,
    ProposalStatus Status,
    DateTime CreatedAt
);

public record ModerationFilterParams(
    ManagedEntityType? EntityType,
    string? Status,
    int Page = 1,
    int PageSize = 20
);
