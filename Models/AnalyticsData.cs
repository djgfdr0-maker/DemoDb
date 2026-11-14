namespace Demonstration_Database.Models;

public class AnalyticsData
{
    public int Id { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public string MetricValue { get; set; } = string.Empty;
    public string Change { get; set; } = string.Empty;
}