using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class EntityUpdateRequestRepository
{
    private readonly NightniceDbContext _context;

    public EntityUpdateRequestRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task<EntityUpdateRequest> CreateAsync(EntityUpdateRequest request)
    {
        _context.EntityUpdateRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<IReadOnlyList<EntityUpdateRequest>> GetPendingAsync(ManagedEntityType entityType, int page, int pageSize)
    {
        return await _context.EntityUpdateRequests
            .Where(r => r.EntityType == entityType && r.Status == UpdateRequestStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateStatusAsync(EntityUpdateRequest request, UpdateRequestStatus status, Guid? reviewerId)
    {
        request.Status = status;
        request.ReviewedByAdminId = reviewerId;
        request.ReviewedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }
}
