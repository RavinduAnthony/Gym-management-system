using GymManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymManagement.Infrastructure.Persistence.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasIndex(e => new { e.Month, e.Year });

        builder.HasOne(e => e.AddedBy)
            .WithMany()
            .HasForeignKey(e => e.AddedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
