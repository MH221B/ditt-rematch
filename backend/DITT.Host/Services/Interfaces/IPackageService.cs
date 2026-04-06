using DITT.SDK.Packaging;

namespace DITT.Host.Services;

public interface IPackageService
{
    public Task<(bool success, string error, PluginPackage? package, string? dllPath, PluginManifest? manifest)> UploadPackageAsync(IFormFile file);
    
    public Task<IEnumerable<PluginPackage>> GetPackagesAsync();

    public Task<bool> DeletePackageAsync(Guid id);

    public Task LinkToToolAsync(Guid packageId, Guid toolId);

    public Task UpdatePackageAsync(PluginPackage package);

    public Task<PluginManifest> ExtractManifestFromPackageAsync(string packagePath);
}