using GymManagement.Domain.Common;

namespace GymManagement.Domain.Entities;

public class Coach : BaseEntity
{
    public int UserId { get; set; }
    public string Specialization { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Member> AssignedMembers { get; set; } = new List<Member>();
}
