using DITT.Host.Services.Interfaces;
using DITT.PluginLoader;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers
{
    [ApiController]
    [Route("api/plugins")]
    public class PluginController : ControllerBase
    {
        private readonly PluginManager _pluginManager;
        private readonly IToolRegistrationService _registrationService;
        private readonly ILogger<PluginController> _logger;
        private readonly string _pluginDirectory;

        public PluginController(PluginManager pluginManager, IToolRegistrationService registrationService, ILogger<PluginController> logger, IConfiguration config)
        {
            _pluginManager = pluginManager;
            _registrationService = registrationService;
            _logger = logger;
            _pluginDirectory = config["PluginDirectory"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "plugins");
        }

        // List all Plugins
        [HttpGet]
        public async Task<IActionResult> GetAll()
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
                t.FrontendBundlePath
            }));
        }

        // Upload Plugin
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
    }
}