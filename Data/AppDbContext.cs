using Microsoft.EntityFrameworkCore;
using Demonstration_Database.Models;

namespace Demonstration_Database.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<DatabaseEntry> Entries => Set<DatabaseEntry>();
    public DbSet<AutomationRule> Automations => Set<AutomationRule>();
    public DbSet<AuditLog> Logs => Set<AuditLog>();
    public DbSet<VisitorSession> Visitors => Set<VisitorSession>();
    public DbSet<AnalyticsData> Analytics => Set<AnalyticsData>();
}