using DITT.Core.Enums;
using DITT.Host.Services;
using DITT.Host.Services.Interfaces;
using DITT.PluginLoader;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers
{
    [ApiController]
    [Route("api/plugins")]
    public class PluginController : ControllerBase
    {
        private readonly PluginManager _pluginManager;
        private readonly IToolRegistrationService _registrationService;
        private readonly IPackageService _packageService;
        private readonly ILogger<PluginController> _logger;
        private readonly string _pluginDirectory;

        public PluginController(PluginManager pluginManager, IToolRegistrationService registrationService, IPackageService packageService, ILogger<PluginController> logger, IConfiguration config)
        {
            _pluginManager = pluginManager;
            _registrationService = registrationService;
            _packageService = packageService;
            _logger = logger;
            _pluginDirectory = config["PluginDirectory"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "plugins");
        }

        // List all Plugins (including disabled)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tools = await _registrationService.GetAllAsync();
            return Ok(tools.Select(t => new
            {
                t.Id,
                t.Name,
                t.Version,
                t.Description,
                t.IsBuiltIn,
                t.Status,
                t.IsPremium,
                frontendBundleUrl = t.PackageId.HasValue && !string.IsNullOrEmpty(t.FrontendBundlePath)
                    ? $"/api/packages/{t.PackageId}/bundle/plugin-bundle.js"
                    : null
            }));
        }

        // List only Active Plugins
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var tools = await _registrationService.GetAllActiveAsync();
            return Ok(tools.Select(t => new
            {
                t.Id,
                t.Name,
                t.Version,
                t.Description,
                t.IsBuiltIn,
                t.Status,
                t.IsPremium,
                frontendBundleUrl = t.PackageId.HasValue && !string.IsNullOrEmpty(t.FrontendBundlePath)
                    ? $"/api/packages/{t.PackageId}/bundle/plugin-bundle.js"
                    : null
            }));
        }

        // Upload Plugin
        [Authorize(Roles = "Admin")]
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (!file.FileName.EndsWith(".dll", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only .dll files are allowed.");
            
            var pluginDir = Path.Combine(_pluginDirectory, Path.GetFileNameWithoutExtension(file.FileName));
            Directory.CreateDirectory(pluginDir);

            var dllPath = Path.Combine(pluginDir, file.FileName);

            using (var stream = System.IO.File.Create(dllPath))
                await file.CopyToAsync(stream);

            // Attempt to load the plugin
            var result = await _pluginManager.LoadPluginAsync(dllPath);

            if (!result.IsValid)
            {
                System.IO.File.Delete(dllPath); // Clean up invalid plugin file
                return BadRequest(new { Message = "Plugin validation failed.", result.Errors });
            }

            // Register in DB
            var plugin = _pluginManager.GetAllInstances()
                .FirstOrDefault(p => p.Name == result.LoadedPluginName);
            
            if (plugin == null)
                return StatusCode(500, new { Message = "Plugin loaded but could not be retrieved" });
            
            await _registrationService.RegisterAsync(plugin, isBuiltIn: false);

            return Ok(new 
            { 
                Message = "Plugin uploaded and loaded successfully.",
                plugin.Name,
                plugin.Version,
                result.Warnings 
            });
        }

        // Unload Plugin
        [Authorize(Roles = "Admin")]
        [HttpPost("unload")]
        public async Task<IActionResult> Unload([FromQuery] string name)
        {
            if (!_pluginManager.IsLoaded(name))
                return NotFound("Plugin not found.");

            _pluginManager.UnloadPlugin(name);
            await _registrationService.UnregisterAsync(name);

            return Ok(new { Message = $"Plugin '{name}' unloaded successfully." });
        }

        // Get Plugin Details
        [HttpGet("{name}")]
        public async Task<IActionResult> GetDetails(string name)
        {
            var dbRecord = await _registrationService.GetAllActiveAsync();
            var tool = dbRecord.FirstOrDefault(t => t.Name == name);
            if (tool == null)
                return NotFound("Plugin not found.");
            return Ok(tool);
        }

        // Update Tool Status
        [Authorize(Roles = "Admin")]
        [HttpPut("{name}/status")]
        public async Task<IActionResult> UpdateStatus(string name, [FromBody] UpdateToolStatusRequest request)
        {
            if (request == null || !Enum.TryParse<ToolStatus>(request.Status, out var newStatus))
                return BadRequest("Invalid status value.");

            var tool = await _registrationService.UpdateToolStatusAsync(name, newStatus);
            if (tool == null)
                return NotFound($"Tool '{name}' not found.");

            return Ok(new
            {
                tool.Id,
                tool.Name,
                tool.Version,
                tool.Description,
                tool.IsBuiltIn,
                tool.Status,
                tool.IsPremium,
                frontendBundleUrl = tool.PackageId.HasValue && !string.IsNullOrEmpty(tool.FrontendBundlePath)
                    ? $"/api/packages/{tool.PackageId}/bundle/plugin-bundle.js"
                    : null
            });
        }

        // Update Tool Premium Status
        [Authorize(Roles = "Admin")]
        [HttpPut("{name}/premium")]
        public async Task<IActionResult> UpdatePremium(string name, [FromBody] UpdateToolPremiumRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request.");

            var tool = await _registrationService.UpdatePremiumAsync(name, request.IsPremium);
            if (tool == null)
                return NotFound($"Tool '{name}' not found.");

            return Ok(new
            {
                tool.Id,
                tool.Name,
                tool.Version,
                tool.Description,
                tool.IsBuiltIn,
                tool.Status,
                tool.IsPremium,
                frontendBundleUrl = tool.PackageId.HasValue && !string.IsNullOrEmpty(tool.FrontendBundlePath)
                    ? $"/api/packages/{tool.PackageId}/bundle/plugin-bundle.js"
                    : null
            });
        }

        // Delete Tool
        [Authorize(Roles = "Admin")]
        [HttpDelete("{name}")]
        public async Task<IActionResult> Delete(string name)
        {
            try
            {
                // Get all tools to find the one to delete
                var allTools = await _registrationService.GetAllAsync();
                var tool = allTools.FirstOrDefault(t => t.Name == name);

                if (tool == null)
                    return NotFound(new { error = $"Tool '{name}' not found." });

                // Handle built-in tools: soft delete (change status to Disabled)
                if (tool.IsBuiltIn)
                {
                    if (tool.Status == ToolStatus.Disabled)
                        return BadRequest(new { error = $"Tool '{name}' is already disabled." });

                    await _registrationService.UpdateToolStatusAsync(name, ToolStatus.Disabled);
                    _logger.LogInformation("Disabled built-in tool: {ToolName}", name);
                    return Ok(new { message = $"Built-in tool '{name}' has been disabled." });
                }

                // Handle plugin tools: hard delete (unload + delete package)
                try
                {
                    // 1. Unload plugin from memory first (releases DLL lock)
                    // This must happen BEFORE attempting to delete files
                    if (_pluginManager.IsLoaded(name))
                    {
                        await _pluginManager.UnloadPluginAsync(name);
                        _logger.LogInformation("Unloaded plugin: {PluginName}", name);
                    }

                    // 2. Delete associated package if it exists
                    // Now that the DLL is unloaded, file deletion should succeed
                    if (tool.PackageId.HasValue)
                    {
                        var success = await _packageService.DeletePackageAsync(tool.PackageId.Value);
                        if (success)
                            _logger.LogInformation("Deleted package for tool: {ToolName}", name);
                        else
                            _logger.LogWarning("Failed to delete package for tool: {ToolName}", name);
                    }

                    // 3. Delete tool record from database
                    var deleted = await _registrationService.DeleteAsync(name);
                    if (deleted)
                        _logger.LogInformation("Deleted tool from database: {ToolName}", name);
                    else
                        _logger.LogWarning("Failed to delete tool from database: {ToolName}", name);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting plugin tool: {ToolName}", name);
                    return StatusCode(500, new { error = $"Error deleting tool '{name}': {ex.Message}" });
                }

                return Ok(new { message = $"Plugin tool '{name}' has been deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error deleting tool: {ToolName}", name);
                return StatusCode(500, new { error = "An unexpected error occurred while deleting the tool." });
            }
        }
    }

    public class UpdateToolStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateToolPremiumRequest
    {
        public bool IsPremium { get; set; }
    }
}