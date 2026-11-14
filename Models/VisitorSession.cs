namespace Demonstration_Database.Models;

public class VisitorSession
{
    public int Id { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public int VisitorNumber { get; set; } // ID od 1 do beskonačno
    public string CurrentPackage { get; set; } = "premium"; // basic, standard, premium
    public string CurrentRole { get; set; } = "Administrator"; // Administrator, Editor, Viewer
    public string FirstSeen { get; set; } = string.Empty;
}