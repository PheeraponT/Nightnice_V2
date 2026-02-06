using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class EntityClaimRepository
{
    private readonly NightniceDbContext _context;

    public EntityClaimRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<EntityClaim> CreateAsync(EntityClaim claim)
    {
        _context.EntityClaims.Add(claim);
        await _context.SaveChangesAsync();
        return claim;
    }

    public Task<EntityClaim?> GetByIdAsync(Guid id)
    {
        return _context.EntityClaims
            .Include(c => c.RequestedBy)
            .FirstOrDefaultAsync(c => c.Id == id);
    }


    public async Task<IReadOnlyList<EntityClaim>> GetPendingAsync(ManagedEntityType entityType, int page, int pageSize)
    {
        return await _context.EntityClaims
            .Where(c => c.EntityType == entityType && c.Status == ClaimStatus.Pending)
            .OrderBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateStatusAsync(EntityClaim claim, ClaimStatus status, Guid? reviewerId, string? notes)
    {
        claim.Status = status;
        claim.ReviewedByAdminId = reviewerId;
        claim.ReviewedAt = DateTime.UtcNow;
        claim.Notes = notes;
        claim.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
