namespace Demonstration_Database.Models;

public class DatabaseEntry
{
    public int Id { get; set; }
    public string EntryCode { get; set; } = string.Empty; // npr. ID12504
    public string Name { get; set; } = string.Empty;      // npr. test1
    public string Type { get; set; } = "Type A";          // Type A, Type B, Type C, Other
    public string CreatedAt { get; set; } = string.Empty; // 12.11.2026. 17:45:32
    public string Status { get; set; } = "Active";
}