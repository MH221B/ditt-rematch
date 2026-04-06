using DITT.Host.Services;
using DITT.Host.Services.Interfaces;
using DITT.PluginLoader;
using DITT.SDK.Packaging;
using DITT.Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers;

[ApiController]
[Route("api/packages")]
public class PackageController : ControllerBase
{
    private readonly IPackageService _packageService;
    private readonly PluginManager _pluginManager;
    private readonly IToolRegistrationService _toolRegistrationService;
    private readonly ILogger<PackageController> _logger;

    public PackageController(
        IPackageService packageService,
        PluginManager pluginManager,
        IToolRegistrationService toolRegistrationService,
        ILogger<PackageController> logger)
    {
        _packageService = packageService;
        _pluginManager = pluginManager;
        _toolRegistrationService = toolRegistrationService;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        var (success, error, package, dllPath, manifest) = await _packageService.UploadPackageAsync(file);

        if (!success)
            return BadRequest(new { error });

        // If upload succeeded but DLL path is missing, something went wrong
        if (string.IsNullOrEmpty(dllPath) || manifest == null)
            return StatusCode(500, new { error = "Package uploaded but DLL path is missing" });

        // Attempt to load the DLL and register the tool with transaction safety
        var loadResult = await LoadAndRegisterPluginAsync(package!, dllPath, manifest);
        
        if (!loadResult.success)
        {
            // Plugin loading failed, but package is still in Validated state (retry-able)
            _logger.LogWarning("Failed to load plugin from package {PackageName}: {Error}", 
                package!.Name, loadResult.error);
            
            return Ok(new
            {
                message = "Package uploaded successfully but plugin loading failed",
                package = new
                {
                    package.Id,
                    package.Name,
                    package.Version,
                    package.Status,
                    warning = loadResult.error
                }
            });
        }

        // Success: return package and tool details
        return Ok(new
        {
            message = "Package uploaded and installed successfully",
            package = new
            {
                package!.Id,
                package.Name,
                package.Version,
                package.Author,
                package.Description,
                package.Status,
                package.UploadedAt
            },
            tool = loadResult.tool
        });
    }

    /// <summary>
    /// Atomically loads the plugin DLL and registers it as a tool with transaction safety.
    /// On failure, unloads the plugin to keep memory state consistent.
    /// </summary>
    private async Task<(bool success, string error, object? tool)> LoadAndRegisterPluginAsync(
        PluginPackage package, string dllPath, PluginManifest manifest)
    {
        try
        {
            // Attempt to load the plugin
            var loadResult = await _pluginManager.LoadPluginAsync(dllPath);
            
            if (!loadResult.IsValid)
            {
                var errorMsg = string.Join(", ", loadResult.Errors);
                _logger.LogWarning("Plugin validation failed for package {PackageName}: {Errors}", 
                    package.Name, errorMsg);
                return (false, $"Plugin validation failed: {errorMsg}", null);
            }

            // Get the loaded plugin instance
            var plugin = _pluginManager.GetAllInstances()
                .FirstOrDefault(p => p.Name == loadResult.LoadedPluginName);

            if (plugin == null)
            {
                _logger.LogError("Plugin loaded but instance not found for {PluginName}", 
                    loadResult.LoadedPluginName);
                
                // Unload plugin if we can
                if (!string.IsNullOrEmpty(loadResult.LoadedPluginName))
                {
                    _pluginManager.UnloadPlugin(loadResult.LoadedPluginName);
                }
                
                return (false, "Plugin loaded but could not be retrieved", null);
            }

            // Register the tool in the database
            await _toolRegistrationService.RegisterAsync(plugin, isBuiltIn: false);

            // Link package to tool
            package.Status = PackageStatus.Installed;
            await _packageService.UpdatePackageAsync(package);

            _logger.LogInformation("✅ Plugin loaded and registered from package {PackageName} v{Version}", 
                package.Name, package.Version);

            return (true, string.Empty, new
            {
                plugin.Name,
                plugin.Version,
                plugin.Description
            });
        }
        catch (Exception ex)
        {
            // Unload the plugin if loading succeeded but something else failed
            try
            {
                var pluginName = manifest?.Name ?? package.Name;
                if (_pluginManager.IsLoaded(pluginName))
                {
                    _pluginManager.UnloadPlugin(pluginName);
                    _logger.LogInformation("Unloaded plugin {PluginName} due to error", pluginName);
                }
            }
            catch (Exception unloadEx)
            {
                _logger.LogError(unloadEx, "Error unloading plugin during error recovery");
            }

            _logger.LogError(ex, "Failed to load plugin from package {PackageName}", package.Name);
            return (false, $"Plugin loading failed: {ex.Message}", null);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _packageService.GetPackagesAsync();
        return Ok(packages.Select(p => new
        {
            p.Id,
            p.Name,
            p.Author,
            p.Description,
            p.Status,
            p.UploadedAt    
        }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            // First, attempt to unload if package is installed
            var packages = await _packageService.GetPackagesAsync();
            var package = packages.FirstOrDefault(p => p.Id == id);

            if (package == null)
                return NotFound(new { error = "Package not found" });

            // If package is installed, unload the plugin first
            if (package.Status == PackageStatus.Installed && !string.IsNullOrEmpty(package.Name))
            {
                try
                {
                    if (_pluginManager.IsLoaded(package.Name))
                    {
                        _pluginManager.UnloadPlugin(package.Name);
                        _logger.LogInformation("Unloaded plugin: {PluginName}", package.Name);
                    }

                    // Unregister the tool
                    await _toolRegistrationService.UnregisterAsync(package.Name);
                    _logger.LogInformation("Unregistered tool: {ToolName}", package.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error unloading plugin for package {PackageName}", package.Name);
                    // Continue with deletion even if unload fails
                }
            }

            // Now delete the package
            var success = await _packageService.DeletePackageAsync(id);
            if (!success)
                return StatusCode(500, new { error = "Failed to delete package from database" });

            _logger.LogInformation("✅ Package deleted: {PackageName} v{Version}", package.Name, package.Version);
            return Ok(new { message = "Package deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting package {PackageId}", id);
            return StatusCode(500, new { error = "Error deleting package", details = ex.Message });
        }
    }
}