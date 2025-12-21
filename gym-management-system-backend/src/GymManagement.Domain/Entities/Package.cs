using GymManagement.Domain.Common;
using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class Package : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public MembershipType PackageType { get; set; }
    public int Duration { get; set; } // Duration in months
    public decimal Price { get; set; }
    public string Features { get; set; } = string.Empty; // JSON string
    public string Description { get; set; } = string.Empty;
    public bool CoachingIncluded { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
}
