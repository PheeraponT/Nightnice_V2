using Microsoft.EntityFrameworkCore;
using Nightnice.Api.Models;

namespace Nightnice.Api.Data;

public class NightniceDbContext : DbContext
{
    public NightniceDbContext(DbContextOptions<NightniceDbContext> options) : base(options)
    {
    }

    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<StoreCategory> StoreCategories => Set<StoreCategory>();
    public DbSet<StoreImage> StoreImages => Set<StoreImage>();
    public DbSet<Advertisement> Advertisements => Set<Advertisement>();
    public DbSet<AdMetric> AdMetrics => Set<AdMetric>();
    public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<StoreView> StoreViews => Set<StoreView>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewHelpful> ReviewHelpfuls => Set<ReviewHelpful>();
    public DbSet<ReviewReport> ReviewReports => Set<ReviewReport>();
    public DbSet<StoreRating> StoreRatings => Set<StoreRating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Region
        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Province
        modelBuilder.Entity<Province>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Slug).IsUnique();

            entity.HasOne(e => e.Region)
                .WithMany(r => r.Provinces)
                .HasForeignKey(e => e.RegionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Store
        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(200).IsRequired();
            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            entity.Property(e => e.BannerUrl).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.GoogleMapUrl).HasMaxLength(500);
            entity.Property(e => e.LineId).HasMaxLength(100);
            entity.Property(e => e.FacebookUrl).HasMaxLength(500);
            entity.Property(e => e.InstagramUrl).HasMaxLength(500);
            entity.Property(e => e.Latitude).HasPrecision(10, 8);
            entity.Property(e => e.Longitude).HasPrecision(11, 8);

            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.ProvinceId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsFeatured);
            entity.HasIndex(e => new { e.Latitude, e.Longitude });

            entity.HasOne(e => e.Province)
                .WithMany(p => p.Stores)
                .HasForeignKey(e => e.ProvinceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StoreCategory (Many-to-Many)
        modelBuilder.Entity<StoreCategory>(entity =>
        {
            entity.HasKey(e => new { e.StoreId, e.CategoryId });

            entity.HasOne(e => e.Store)
                .WithMany(s => s.StoreCategories)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.StoreCategories)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StoreImage
        modelBuilder.Entity<StoreImage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();

            entity.HasOne(e => e.Store)
                .WithMany(s => s.Images)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Advertisement
        modelBuilder.Entity<Advertisement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.TargetUrl).HasMaxLength(500);
            entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);

            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => new { e.StartDate, e.EndDate });
            entity.HasIndex(e => e.Type);

            entity.HasOne(e => e.Store)
                .WithMany(s => s.Advertisements)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // AdMetric
        modelBuilder.Entity<AdMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EventType).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.PageContext).HasMaxLength(100);

            entity.HasIndex(e => e.AdId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.AdId, e.EventType });

            entity.HasOne(e => e.Advertisement)
                .WithMany(a => a.Metrics)
                .HasForeignKey(e => e.AdId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ContactInquiry
        modelBuilder.Entity<ContactInquiry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Message).IsRequired();
        });

        // AdminUser
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();

            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Event
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(5000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.TicketUrl).HasMaxLength(500);
            entity.Property(e => e.EventType).HasConversion<string>().HasMaxLength(30);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.PriceMax).HasPrecision(10, 2);
            entity.Property(e => e.RecurrencePattern).HasMaxLength(500);

            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.StoreId);
            entity.HasIndex(e => e.StartDate);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.IsFeatured);
            entity.HasIndex(e => new { e.StartDate, e.EndDate });

            entity.HasOne(e => e.Store)
                .WithMany(s => s.Events)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // StoreView
        modelBuilder.Entity<StoreView>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Referrer).HasMaxLength(500);
            entity.Property(e => e.SessionHash).HasMaxLength(64);

            entity.HasIndex(e => e.StoreId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.StoreId, e.CreatedAt });

            entity.HasOne(e => e.Store)
                .WithMany(s => s.Views)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirebaseUid).HasMaxLength(128).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.DisplayName).HasMaxLength(200);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.BanReason).HasMaxLength(500);

            entity.HasIndex(e => e.FirebaseUid).IsUnique();
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Content).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.AdminNote).HasMaxLength(500);

            entity.HasIndex(e => e.StoreId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.StoreId, e.IsActive });
            entity.HasIndex(e => new { e.StoreId, e.CreatedAt });
            entity.HasIndex(e => e.Rating);
            entity.HasIndex(e => e.CreatedAt);

            entity.HasOne(e => e.Store)
                .WithMany()
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ReviewHelpful
        modelBuilder.Entity<ReviewHelpful>(entity =>
        {
            entity.HasKey(e => new { e.ReviewId, e.UserId });

            entity.HasIndex(e => e.ReviewId);
            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.Review)
                .WithMany(r => r.HelpfulVotes)
                .HasForeignKey(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.HelpfulVotes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ReviewReport
        modelBuilder.Entity<ReviewReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Reason).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.AdminAction).HasMaxLength(50);
            entity.Property(e => e.AdminNotes).HasMaxLength(1000);

            entity.HasIndex(e => e.ReviewId);
            entity.HasIndex(e => e.ReportedByUserId);
            entity.HasIndex(e => e.IsReviewed);
            entity.HasIndex(e => new { e.IsReviewed, e.CreatedAt });

            entity.HasOne(e => e.Review)
                .WithMany(r => r.Reports)
                .HasForeignKey(e => e.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ReportedByUser)
                .WithMany(u => u.Reports)
                .HasForeignKey(e => e.ReportedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReviewedByAdmin)
                .WithMany()
                .HasForeignKey(e => e.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // StoreRating
        modelBuilder.Entity<StoreRating>(entity =>
        {
            entity.HasKey(e => e.StoreId);
            entity.Property(e => e.AverageRating).HasPrecision(3, 2);

            entity.HasOne(e => e.Store)
                .WithOne()
                .HasForeignKey<StoreRating>(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
