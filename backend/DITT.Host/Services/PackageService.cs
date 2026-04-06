using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using DITT.Core.Models;
using DITT.Host.Data;
using DITT.SDK.Packaging;
using Microsoft.EntityFrameworkCore;

namespace DITT.Host.Services;

public class PackageService : IPackageService
{
    private readonly AppDbContext _db;
    private readonly ILogger<PackageService> _logger;
    private readonly string _packagesDir;

    public PackageService(AppDbContext db, ILogger<PackageService> logger, IConfiguration config)
    {
        _db = db;
        _logger = logger;
        _packagesDir = config["PackagesDirectory"] ?? Path.Combine(Directory.GetCurrentDirectory(), "packages");
        Directory.CreateDirectory(_packagesDir);
    }

    public async Task<(bool success, string error, PluginPackage? package, string? dllPath, PluginManifest? manifest)> UploadPackageAsync(IFormFile file)
    {
        if (!file.FileName.EndsWith(".mtpkg"))
            return (false, "File must be .mtpkg extension", null, null, null);
        
        // Save uploaded file
        var tempPath = Path.GetTempFileName();
        using (var stream = File.Create(tempPath))
            await file.CopyToAsync(stream);

        try
        {
            // Extract and validate
            var (manifest, extractPath) = await ExtractPackageAsync(tempPath, _packagesDir);
            var (validation, dllPath) = await ValidatePackageAsync(manifest, extractPath);

            if (!validation.IsValid)
            {
                Directory.Delete(extractPath, true);
                return (false, string.Join(", ", validation.Errors), null, null, null);
            }

            // Check for duplicates
            var existing = await _db.PluginPackages.FirstOrDefaultAsync(p => p.Name == manifest.Name && p.Version == manifest.Version);

            if (existing != null)
            {
                Directory.Delete(extractPath, true);
                return (false, $"Package {manifest.Name} v{manifest.Version} already exists", null, null, null);
            }

            // Move to permanent storage
            var packageDir = Path.Combine(_packagesDir, $"{manifest.Name}.{manifest.Version}");
            if (Directory.Exists(packageDir))
                Directory.Delete(packageDir, true);
            
            Directory.Move(extractPath, packageDir);

            // Save to database - REMOVED IsPremium
            var package = new PluginPackage
            {
                Name = manifest.Name,
                Version = manifest.Version,
                Description = manifest.Description,
                Author = manifest.Author,
                DllHash = manifest.DllHash,
                PackagePath = packageDir,
                FrontendBundlePath = manifest.FrontendBundle != null 
                    ? Path.Combine(packageDir, manifest.FrontendBundle) 
                    : null,
                Status = PackageStatus.Validated,
                UploadedAt = DateTime.UtcNow
            };

            _db.PluginPackages.Add(package);
            await _db.SaveChangesAsync();

            // Compute final DLL path with permanent storage location
            var finalDllPath = Path.Combine(packageDir, manifest.PluginDll);

            _logger.LogInformation("📦 Package uploaded: {Name} v{Version}", 
                manifest.Name, manifest.Version);

            return (true, string.Empty, package, finalDllPath, manifest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process package upload");
            return (false, $"Package processing failed: {ex.Message}", null, null, null);
        }
        finally
        {
            File.Delete(tempPath);
        }
    }

    public async Task<IEnumerable<PluginPackage>> GetPackagesAsync()
    {
        return await _db.PluginPackages
            .Include(p => p.Tool) // Include related Tool if exists
            .OrderByDescending(p => p.UploadedAt)
            .ToListAsync();
    }

    public async Task<bool> DeletePackageAsync(Guid id)
    {
        var package = await _db.PluginPackages.FindAsync(id);
        if (package == null) return false;

        // Delete files
        if (Directory.Exists(package.PackagePath))
            Directory.Delete(package.PackagePath, true);

        // Mark as deleted instead of removing (audit trail)
        package.Status = PackageStatus.Deleted;
        await _db.SaveChangesAsync();

        return true;
    }

    // New method to link package to tool after installation
    public async Task LinkToToolAsync(Guid packageId, Guid toolId)
    {
        var package = await _db.PluginPackages.FindAsync(packageId);
        if (package != null)
        {
            package.ToolId = toolId;
            package.Status = PackageStatus.Installed;
            await _db.SaveChangesAsync();
        }
    }

    // Update package status and tool link
    public async Task UpdatePackageAsync(PluginPackage package)
    {
        _db.PluginPackages.Update(package);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Updated package: {Name} v{Version}, Status: {Status}", 
            package.Name, package.Version, package.Status);
    }

    // Helper to extract manifest from an existing package (used during startup)
    public async Task<PluginManifest> ExtractManifestFromPackageAsync(string packagePath)
    {
        var manifestPath = Path.Combine(packagePath, "manifest.json");
        if (!File.Exists(manifestPath))
            throw new InvalidOperationException($"Manifest not found in package: {packagePath}");
        
        var manifestJson = await File.ReadAllTextAsync(manifestPath);
        var manifest = JsonSerializer.Deserialize<PluginManifest>(manifestJson) 
            ?? throw new InvalidOperationException("Invalid manifest.json");
        
        return manifest;
    }

    private async Task<(PluginManifest manifest, string extractPath)> ExtractPackageAsync(string packagePath, string targetDir)
    {
        var extractPath = Path.Combine(targetDir, $".temp-{Guid.NewGuid()}");
        Directory.CreateDirectory(extractPath);

        ZipFile.ExtractToDirectory(packagePath, extractPath);
        
        var manifestPath = Path.Combine(extractPath, "manifest.json");
        if (!File.Exists(manifestPath))
            throw new InvalidOperationException("Package missing manifest.json");
        var manifestJson = await File.ReadAllTextAsync(manifestPath);
        var manifest = JsonSerializer.Deserialize<PluginManifest>(manifestJson) ?? throw new InvalidOperationException("Invalid manifest.json");

        return (manifest, extractPath);
    }

    private async Task<(ValidationResult validation, string? dllPath)> ValidatePackageAsync(PluginManifest manifest, string extractPath)
    {
        var errors = new List<string>();
        var dllPath = Path.Combine(extractPath, manifest.PluginDll);

        // Validate DLL exists
        if (!File.Exists(dllPath))
            errors.Add($"Plugin DLL not found: {manifest.PluginDll}");
        else
        {
            //  Validate DLL hash
            var actualHash = CalculateSha256(dllPath);
            if (actualHash != manifest.DllHash)
                errors.Add("DLL integrity check failed - hash mismatch");
        }

        //  Validate frontend bundle if specified
        if (!string.IsNullOrEmpty(manifest.FrontendBundle))
        {
            var bundlePath = Path.Combine(extractPath, manifest.FrontendBundle);
            if (!File.Exists(bundlePath))
                errors.Add($"Frontend bundle not found: {manifest.FrontendBundle}");
        }

        var validation = new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };

        return (validation, errors.Count == 0 ? dllPath : null);
    }

    private static string CalculateSha256(string filePath)
    {
        using var sha256 = SHA256.Create();
        using var stream = File.OpenRead(filePath);
        var hash = sha256.ComputeHash(stream);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

}