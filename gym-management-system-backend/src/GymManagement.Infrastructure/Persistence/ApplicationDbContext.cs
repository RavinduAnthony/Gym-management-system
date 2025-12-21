using GymManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GymManagement.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Coach> Coaches { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Package> Packages { get; set; }
    public DbSet<Membership> Memberships { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Expense> Expenses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Configure enum conversions
        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Package>()
            .Property(p => p.PackageType)
            .HasConversion<string>();

        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentMethod)
            .HasConversion<string>();

        modelBuilder.Entity<Payment>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Expense>()
            .Property(e => e.Category)
            .HasConversion<string>();
    }
}
