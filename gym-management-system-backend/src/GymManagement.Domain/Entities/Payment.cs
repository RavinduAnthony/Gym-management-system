using GymManagement.Domain.Common;
using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class Payment : BaseEntity
{
    public int MemberId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public int PaymentMonth { get; set; }
    public int PaymentYear { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Notes { get; set; }
    public int? AddedById { get; set; }

    // Navigation properties
    public Member Member { get; set; } = null!;
    public User? AddedBy { get; set; }
}
