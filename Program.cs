using Microsoft.EntityFrameworkCore;
using Demonstration_Database.Data;
using Demonstration_Database.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=demonstration_database.db"));

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    
    // Seed test analytics ako nema
    if (!db.Analytics.Any())
    {
        db.Analytics.AddRange(
            new AnalyticsData { MetricName = "Query Latency", MetricValue = "12.4 ms", Change = "-1.2ms" },
            new AnalyticsData { MetricName = "Active Connections", MetricValue = "1,420", Change = "+14%" },
            new AnalyticsData { MetricName = "Cache Hit Rate", MetricValue = "99.4%", Change = "+0.2%" },
            new AnalyticsData { MetricName = "Error Rate", MetricValue = "0.01%", Change = "-0.005%" }
        );
        db.SaveChanges();
    }
    DbSeeder.Seed(db);
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

// Helper za dohvat ili kreiranje posjetitelja po IP adresi
async Task<VisitorSession> GetOrCreateVisitorAsync(HttpContext context, AppDbContext db)
{
    string ip = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    if (ip == "::1") ip = "127.0.0.1";

    var visitor = await db.Visitors.FirstOrDefaultAsync(v => v.IpAddress == ip);
    if (visitor == null)
    {
        int nextId = await db.Visitors.CountAsync() + 1;
        visitor = new VisitorSession
        {
            IpAddress = ip,
            VisitorNumber = nextId,
            CurrentPackage = "premium",
            CurrentRole = "Administrator",
            FirstSeen = DateTime.UtcNow.ToString("o") // Fiksni timestamp za uptime
        };
        db.Visitors.Add(visitor);
        await db.SaveChangesAsync();
    }
    return visitor;
}

// --- API RUTE ---

app.MapGet("/api/session", async (HttpContext context, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    
    // Izračun uptime-a od trenutka prvog posjeta
    DateTime firstSeenTime = DateTime.Parse(visitor.FirstSeen);
    TimeSpan uptimeSpan = DateTime.UtcNow - firstSeenTime;
    string uptimeFormatted = $"{(int.Parse(uptimeSpan.TotalDays.ToString("0")) * 24 + uptimeSpan.Hours)}h {uptimeSpan.Minutes}m";

    return Results.Ok(new
    {
        userId = $"User #{visitor.VisitorNumber}",
        currentPackage = visitor.CurrentPackage,
        currentRole = visitor.CurrentRole,
        uptime = uptimeFormatted
    });
});

app.MapPost("/api/session/update", async (HttpContext context, AppDbContext db, SessionUpdateModel model) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    if (!string.IsNullOrEmpty(model.Package)) visitor.CurrentPackage = model.Package;
    if (!string.IsNullOrEmpty(model.Role)) visitor.CurrentRole = model.Role;
    await db.SaveChangesAsync();
    return Results.Ok(visitor);
});

app.MapGet("/api/dashboard", async (HttpContext context, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    var entries = await db.Entries.OrderByDescending(e => e.Id).ToListAsync();
    
    return Results.Ok(new
    {
        package = visitor.CurrentPackage,
        role = visitor.CurrentRole,
        stats = new { totalEntries = 12481 + entries.Count, uniqueUsers = 1248, totalSize = visitor.CurrentPackage == "basic" ? "50 MB" : "312 MB" },
        activityChart = new { labels = new[] { "Nov 6", "Nov 7", "Nov 8", "Nov 9", "Nov 10", "Nov 11", "Nov 12" }, values = new[] { 490, 770, 505, 405, 725, 750, 860 } },
        distribution = new[]
        {
            new { label = "Type A", percentage = 45.2, color = "#3b82f6" },
            new { label = "Type B", percentage = 32.1, color = "#6366f1" },
            new { label = "Type C", percentage = 15.6, color = "#10b981" },
            new { label = "Other", percentage = 7.1, color = "#f59e0b" }
        },
        entries
    });
});

app.MapGet("/api/security", async (HttpContext context, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    var automations = await db.Automations.ToListAsync();
    var logs = await db.Logs.OrderByDescending(l => l.Id).Take(15).ToListAsync();
    
    return Results.Ok(new { package = visitor.CurrentPackage, role = visitor.CurrentRole, automations, logs });
});

app.MapGet("/api/analytics", async (AppDbContext db) =>
{
    var metrics = await db.Analytics.ToListAsync();
    return Results.Ok(metrics);
});

app.MapPost("/api/entries", async (HttpContext context, DatabaseEntry input, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    if (visitor.CurrentRole == "Viewer") return Results.BadRequest("Viewers cannot add entries.");

    var lastEntry = await db.Entries.OrderByDescending(e => e.Id).FirstOrDefaultAsync();
    int nextNum = lastEntry != null && int.TryParse(lastEntry.EntryCode.Replace("ID", ""), out int p) ? p + 1 : 12505;

    var newEntry = new DatabaseEntry
    {
        EntryCode = $"ID{nextNum}",
        Name = string.IsNullOrWhiteSpace(input.Name) ? $"test{nextNum}" : input.Name,
        Type = input.Type,
        CreatedAt = DateTime.Now.ToString("dd.MM.yyyy. HH:mm:ss"),
        Status = "Active"
    };

    db.Entries.Add(newEntry);
    db.Logs.Add(new AuditLog { Time = newEntry.CreatedAt, User = visitor.CurrentRole, Action = "Added entry", Details = $"ID: {nextNum}", Status = "Success" });
    await db.SaveChangesAsync();
    return Results.Ok(newEntry);
});

app.MapDelete("/api/entries/{id}", async (HttpContext context, int id, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    if (visitor.CurrentRole != "Administrator") return Results.BadRequest("Only Administrators can delete entries.");

    var entry = await db.Entries.FindAsync(id);
    if (entry == null) return Results.NotFound();

    db.Entries.Remove(entry);
    db.Logs.Add(new AuditLog { Time = DateTime.Now.ToString("dd.MM.yyyy. HH:mm:ss"), User = visitor.CurrentRole, Action = "Deleted entry", Details = $"ID: {entry.EntryCode}", Status = "Warning" });
    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapPost("/api/automations/{id}/toggle", async (HttpContext context, int id, AppDbContext db) =>
{
    var visitor = await GetOrCreateVisitorAsync(context, db);
    if (visitor.CurrentRole == "Viewer") return Results.BadRequest("Viewers have read-only access and cannot modify automation workflows.");
    if (visitor.CurrentPackage == "basic") return Results.BadRequest("Automations require Standard or Premium package.");

    var rule = await db.Automations.FindAsync(id);
    if (rule == null) return Results.NotFound();

    rule.IsEnabled = !rule.IsEnabled;
    db.Logs.Add(new AuditLog { Time = DateTime.Now.ToString("dd.MM.yyyy. HH:mm:ss"), User = visitor.CurrentRole, Action = "Changed settings", Details = $"{rule.Title} toggled", Status = "Success" });
    await db.SaveChangesAsync();
    return Results.Ok(rule);
});

app.Run();

public class SessionUpdateModel
{
    public string? Package { get; set; }
    public string? Role { get; set; }
}