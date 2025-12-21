using GymManagement.Domain.Common;
using GymManagement.Domain.Enums;

namespace GymManagement.Domain.Entities;

public class Expense : BaseEntity
{
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int AddedById { get; set; }

    // Navigation properties
    public User AddedBy { get; set; } = null!;
}
