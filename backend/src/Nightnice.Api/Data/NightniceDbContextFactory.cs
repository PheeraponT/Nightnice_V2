using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Nightnice.Api.Data;

public class NightniceDbContextFactory : IDesignTimeDbContextFactory<NightniceDbContext>
{
    public NightniceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<NightniceDbContext>();

        var connectionString =
            Environment.GetEnvironmentVariable("NIGHTNICE_CONNECTION") ??
            "Host=localhost;Port=5432;Database=nightnice;Username=nightnice;Password=postgres";

        optionsBuilder.UseNpgsql(connectionString);

        return new NightniceDbContext(optionsBuilder.Options);
    }
}
