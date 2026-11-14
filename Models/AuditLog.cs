namespace Demonstration_Database.Models;

public class AuditLog
{
    public int Id { get; set; }
    public string Time { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Status { get; set; } = "Success"; // Success ili Warning
}