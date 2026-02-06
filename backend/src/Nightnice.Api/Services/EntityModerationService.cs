using Nightnice.Api.Data.Repositories;
using Nightnice.Api.Models;

namespace Nightnice.Api.Services;

public class EntityModerationService
{
    private readonly EntityClaimRepository _claimRepository;
    private readonly EntityUpdateRequestRepository _updateRepository;
    private readonly EntityProposalRepository _proposalRepository;
    private readonly EntityVerificationLogRepository _logRepository;

    public EntityModerationService(
        EntityClaimRepository claimRepository,
        EntityUpdateRequestRepository updateRepository,
        EntityProposalRepository proposalRepository,
        EntityVerificationLogRepository logRepository)
    {
        _claimRepository = claimRepository;
        _updateRepository = updateRepository;
        _proposalRepository = proposalRepository;
        _logRepository = logRepository;
    }

    public async Task<EntityClaim> SubmitClaimAsync(
        ManagedEntityType entityType,
        Guid entityId,
        Guid userId,
        string? evidenceUrl,
        string? notes)
    {
        var claim = new EntityClaim
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            RequestedByUserId = userId,
            EvidenceUrl = evidenceUrl,
            Notes = notes
        };

        await _claimRepository.CreateAsync(claim);
        await _logRepository.CreateAsync(new EntityVerificationLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            ActorUserId = userId,
            Action = "claim_submitted",
            Notes = notes
        });

        return claim;
    }

    public async Task<EntityUpdateRequest> SubmitUpdateRequestAsync(
        ManagedEntityType entityType,
        Guid entityId,
        Guid userId,
        string payloadJson,
        string? proofMediaUrl,
        string? externalProofUrl)
    {
        var request = new EntityUpdateRequest
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            SubmittedByUserId = userId,
            PayloadJson = payloadJson,
            ProofMediaUrl = proofMediaUrl,
            ExternalProofUrl = externalProofUrl
        };

        await _updateRepository.CreateAsync(request);
        await _logRepository.CreateAsync(new EntityVerificationLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            ActorUserId = userId,
            Action = "update_submitted"
        });

        return request;
    }

    public async Task<EntityProposal> SubmitProposalAsync(
        ManagedEntityType entityType,
        Guid userId,
        string name,
        string payloadJson,
        string? referenceUrl)
    {
        var proposal = new EntityProposal
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            SubmittedByUserId = userId,
            Name = name,
            PayloadJson = payloadJson,
            ReferenceUrl = referenceUrl
        };

        await _proposalRepository.CreateAsync(proposal);
        await _logRepository.CreateAsync(new EntityVerificationLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = Guid.Empty,
            ActorUserId = userId,
            Action = "proposal_submitted",
            Notes = name
        });

        return proposal;
    }
}
