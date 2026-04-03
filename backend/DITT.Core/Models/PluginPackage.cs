namespace DITT.Core.Models;

public class PluginPackage
{
    public Guid Id  { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public bool IsPremium { get; set; }
    public string DllHash { get; set; } = string.Empty;
    public string PackagePath { get; set; } = string.Empty;
    public string? FrontendBundlePath { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public PackageStatus Status { get; set; } = PackageStatus.Uploaded;
}

public enum PackageStatus
{
    Uploaded,
    Validated,
    Installed,
    Failed,
    Deleted
}