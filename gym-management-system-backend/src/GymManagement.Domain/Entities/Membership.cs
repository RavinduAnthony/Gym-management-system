using GymManagement.Domain.Common;

namespace GymManagement.Domain.Entities;

public class Membership : BaseEntity
{
    public int MemberId { get; set; }
    public int PackageId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Member Member { get; set; } = null!;
    public Package Package { get; set; } = null!;
}
