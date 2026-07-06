using BikeSense.Api.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace BikeSense.Api.Infrastructure.Data
{
    public class BikeSenseDbContext : DbContext
    {
        public BikeSenseDbContext(DbContextOptions<BikeSenseDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Bike> Bikes => Set<Bike>();
        public DbSet<BikeImage> BikeImages => Set<BikeImage>();
        public DbSet<FraudReport> FraudReports => Set<FraudReport>();
        public DbSet<DealerMetric> DealerMetrics => Set<DealerMetric>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Many-to-Many: User <-> Role
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRoles",
                    j => j.HasOne<Role>().WithMany().HasForeignKey("RoleId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade));

            // One-to-Many: User (Seller) -> Bikes
            modelBuilder.Entity<Bike>()
                .HasOne(b => b.Seller)
                .WithMany(u => u.Bikes)
                .HasForeignKey(b => b.SellerId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Bike -> BikeImages
            modelBuilder.Entity<BikeImage>()
                .HasOne(bi => bi.Bike)
                .WithMany(b => b.BikeImages)
                .HasForeignKey(bi => bi.BikeId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-Many: Bike -> FraudReports
            modelBuilder.Entity<FraudReport>()
                .HasOne(fr => fr.Bike)
                .WithMany(b => b.FraudReports)
                .HasForeignKey(fr => fr.BikeId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-One: User (Dealer) -> DealerMetric
            modelBuilder.Entity<DealerMetric>()
                .HasOne(dm => dm.Dealer)
                .WithOne(u => u.DealerMetric)
                .HasForeignKey<DealerMetric>(dm => dm.DealerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Administrator" },
                new Role { Id = 2, Name = "Buyer" },
                new Role { Id = 3, Name = "Seller" },
                new Role { Id = 4, Name = "Dealer" }
            );

            // Configurations
            modelBuilder.Entity<Bike>()
                .Property(b => b.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DealerMetric>()
                .Property(dm => dm.TotalRevenue)
                .HasPrecision(18, 2);
        }
    }
}
