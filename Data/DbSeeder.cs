using Demonstration_Database.Models;

namespace Demonstration_Database.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        db.Database.EnsureCreated();

        if (!db.Entries.Any())
        {
            db.Entries.AddRange(
                new DatabaseEntry { EntryCode = "ID12504", Name = "test1", Type = "Type A", CreatedAt = "12.11.2026. 17:45:32", Status = "Active" },
                new DatabaseEntry { EntryCode = "ID12503", Name = "test2", Type = "Type B", CreatedAt = "12.11.2026. 17:42:17", Status = "Active" },
                new DatabaseEntry { EntryCode = "ID12502", Name = "test3", Type = "Type C", CreatedAt = "12.11.2026. 17:40:11", Status = "Active" },
                new DatabaseEntry { EntryCode = "ID12501", Name = "test4", Type = "Type A", CreatedAt = "12.11.2026. 17:38:50", Status = "Active" },
                new DatabaseEntry { EntryCode = "ID12500", Name = "test5", Type = "Type B", CreatedAt = "12.11.2026. 17:37:12", Status = "Active" }
            );
        }

        if (!db.Automations.Any())
        {
            db.Automations.AddRange(
                new AutomationRule { Title = "Daily Backup", Description = "Runs every day at 00:00 • Backup database to cloud", Icon = "database", IsEnabled = true },
                new AutomationRule { Title = "Inactive User Cleanup", Description = "Runs weekly • Remove inactive accounts", Icon = "mail", IsEnabled = true },
                new AutomationRule { Title = "Monthly Report", Description = "Runs monthly • Generate and email report", Icon = "chart", IsEnabled = true }
            );
        }

        if (!db.Logs.Any())
        {
            db.Logs.AddRange(
                new AuditLog { Time = "12.11.2026. 17:45:32", User = "Antonio", Action = "Updated user role", Details = "User test1 → Editor", Status = "Success" },
                new AuditLog { Time = "12.11.2026. 16:32:17", User = "Admin", Action = "Created backup", Details = "Database backup completed", Status = "Success" },
                new AuditLog { Time = "12.11.2026. 14:20:05", User = "Antonio", Action = "Deleted entry", Details = "ID: 12503", Status = "Warning" },
                new AuditLog { Time = "12.11.2026. 12:11:44", User = "Admin", Action = "Changed settings", Details = "Security policy updated", Status = "Success" },
                new AuditLog { Time = "12.11.2026. 10:09:21", User = "Editor", Action = "Added entry", Details = "ID: 12502", Status = "Success" }
            );
        }

        db.SaveChanges();
    }
}