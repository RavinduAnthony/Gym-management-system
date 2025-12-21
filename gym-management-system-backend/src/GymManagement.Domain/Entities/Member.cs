using GymManagement.Domain.Common;

namespace GymManagement.Domain.Entities;

public class Member : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string NIC { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal? Height { get; set; }
    public decimal? Weight { get; set; }
    public DateTime JoinDate { get; set; } = DateTime.UtcNow;
    public int? CoachId { get; set; }

    // Navigation properties
    public Coach? Coach { get; set; }
    public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
