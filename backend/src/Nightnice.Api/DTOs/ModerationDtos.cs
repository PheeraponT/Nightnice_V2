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
