using DITT.Core.Models;

public class PluginPackage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    
    // Package-specific fields
    public string DllHash { get; set; } = string.Empty;
    public string PackagePath { get; set; } = string.Empty;
    public string? FrontendBundlePath { get; set; }
    
    // Metadata
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public PackageStatus Status { get; set; } = PackageStatus.Uploaded;
    
    // Foreign key to Tool (after installation)
    public Guid? ToolId { get; set; }
    public Tool? Tool { get; set; }
}

public enum PackageStatus
{
    Uploaded,    // Just uploaded, not yet validated
    Validated,   // Passed validation checks
    Installed,   // Loaded into memory, linked to Tool
    Failed,      // Validation/install failed
    Deleted      // Marked for deletion
}