namespace DITT.Core.Models;

public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = [];
    public List<string> Warnings { get; set; } = [];
    public string? LoadedPluginName { get; set; }

    public static ValidationResult Success(string pluginName) => new() 
    { 
        IsValid = true,
        LoadedPluginName = pluginName
    };
    public static ValidationResult Failure(params string[] errors) => new() 
    { 
        IsValid = false, 
        Errors = errors.ToList() 
    };
}