using GymManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymManagement.Infrastructure.Persistence.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(m => m.Email)
            .IsUnique();

        builder.Property(m => m.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(m => m.NIC)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(m => m.NIC)
            .IsUnique();

        builder.Property(m => m.Address)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.Height)
            .HasColumnType("decimal(5,2)");

        builder.Property(m => m.Weight)
            .HasColumnType("decimal(6,2)");

        // Many-to-one relationship with Coach
        builder.HasOne(m => m.Coach)
            .WithMany(c => c.AssignedMembers)
            .HasForeignKey(m => m.CoachId)
            .OnDelete(DeleteBehavior.SetNull);

        // One-to-many relationship with Memberships
        builder.HasMany(m => m.Memberships)
            .WithOne(ms => ms.Member)
            .HasForeignKey(ms => ms.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-many relationship with Payments
        builder.HasMany(m => m.Payments)
            .WithOne(p => p.Member)
            .HasForeignKey(p => p.MemberId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
