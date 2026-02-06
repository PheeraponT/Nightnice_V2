using Nightnice.Api.Models;

namespace Nightnice.Api.Data.Repositories;

public class EntityVerificationLogRepository
{
    private readonly NightniceDbContext _context;

    public EntityVerificationLogRepository(NightniceDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(EntityVerificationLog log)
    {
        _context.EntityVerificationLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
