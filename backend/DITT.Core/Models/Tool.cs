using DITT.Core.Enums;

namespace DITT.Core.Models;

public class Tool
{
    public Guid Id { get; set; }
    public string Name { get; set;} = string.Empty;
    public string Version { get; set;} = string.Empty;
    public string Description { get; set;} = string.Empty;
    public bool IsBuiltIn { get; set; }
    public ToolStatus Status { get; set; }
    public bool IsPremium { get; set; }
    public string? FrontendBundlePath { get; set; }
    public Guid? PackageId { get; set; }

}