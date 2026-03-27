using DITT.Core.Models;
using DITT.SDK;
using Microsoft.Extensions.Logging;

namespace DITT.PluginLoader
{
    public class PluginManager : IPluginManager
    {
        // Thread-safe dictionary - multiple requests could load plugins simultaneously
        private readonly Dictionary<string, LoadedPlugin> _plugins = new();
        private readonly object _lock = new();
        private readonly ILogger<PluginManager> _logger;
        private readonly string _pluginDirectory;

        public PluginManager(ILogger<PluginManager> logger, string pluginDirectory)
        {
            _logger = logger;
            _pluginDirectory = pluginDirectory;
            Directory.CreateDirectory(_pluginDirectory); // Ensure the plugin directory exists
        }

        public async Task<ValidationResult> LoadPluginAsync(string dllPath)
        {
            _logger.LogInformation("Attempting to load plugin from {DllPath}", dllPath);

            // Validate
            var validator = new PluginValidator(GetLoadedPluginNames());
            var validation = validator.Validate(dllPath);
            if (!validation.IsValid)
            {
                _logger.LogWarning("Plugin validation failed for {DllPath}: {Errors}", dllPath, string.Join(", ", validation.Errors));
                return validation;
            }

            try
            {
                var context = new PluginLoadContext(dllPath);
                var assembly = context.LoadFromAssemblyPath(dllPath);

                var pluginType = assembly.GetTypes()
                                        .First(t => typeof(IToolPlugin).IsAssignableFrom(t) 
                                        && !t.IsAbstract && !t.IsInterface);
                
                var instance = (IToolPlugin)Activator.CreateInstance(pluginType)!;

                var loadedPlugin = new LoadedPlugin
                {
                    Name = instance.Name,
                    Version = instance.Version,
                    Description = instance.Description,
                    IsBuiltIn = false,
                    Instance = instance,
                    LoadContext = context,
                    LoadedAt = DateTime.UtcNow,
                    DllPath = dllPath
                };

                lock (_lock)
                {
                    _plugins[loadedPlugin.Name] = loadedPlugin;
                }

                _logger.LogInformation(
                    "Plugin loaded: {Name} v{Version}",
                    instance.Name,
                    instance.Version);
                
                return ValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load plugin from {DllPath}", dllPath);
                return ValidationResult.Failure($"Failed to load plugin: {ex.Message}");
            }
        }

        private IEnumerable<string> GetLoadedPluginNames()
        {
            lock (_lock)
            {
                return _plugins.Keys.ToList();
            }
        }
    }
}