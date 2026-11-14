namespace Demonstration_Database.Models;

public class AutomationRule
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "database";
    public bool IsEnabled { get; set; } = true;
}