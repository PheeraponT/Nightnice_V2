using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class EntityProposalRepository
{
    private readonly NightniceDbContext _context;

    public EntityProposalRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<EntityProposal> CreateAsync(EntityProposal proposal)
    {
        _context.EntityProposals.Add(proposal);
        await _context.SaveChangesAsync();
        return proposal;
    }

    public async Task<IReadOnlyList<EntityProposal>> GetPendingAsync(ManagedEntityType entityType, int page, int pageSize)
    {
        return await _context.EntityProposals
            .Where(p => p.EntityType == entityType && p.Status == ProposalStatus.Pending)
            .OrderBy(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateStatusAsync(EntityProposal proposal, ProposalStatus status, Guid? reviewerId, string? notes)
    {
        proposal.Status = status;
        proposal.ReviewedByAdminId = reviewerId;
        proposal.ReviewedAt = DateTime.UtcNow;
        proposal.Notes = notes;
        proposal.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
