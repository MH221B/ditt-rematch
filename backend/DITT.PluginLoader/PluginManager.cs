using System.Reflection;
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
                
                return ValidationResult.Success(instance.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load plugin from {DllPath}", dllPath);
                return ValidationResult.Failure($"Failed to load plugin: {ex.Message}");
            }
        }

        public void UnloadPlugin(string name)
        {
            lock (_lock)
            {
                if (!_plugins.TryGetValue(name, out var plugin))
                {
                    _logger.LogWarning("Plugin not found for unload: {Name}", name);
                    return;
                }

                if (plugin.IsBuiltIn)
                {
                    _logger.LogWarning("Cannot unload built-in plugin: {Name}", name);
                    return;
                }

                _plugins.Remove(name);
                //  Unload the AssemblyLoadContext to free resources
                plugin.LoadContext?.Unload();
                _logger.LogInformation("Plugin unloaded: {Name}", name);
            }
        }

        public void RegisterBuiltInTools()
        {
            // Scan the HOST assembly for IToolPlugin implementations
            var builtInTypes = Assembly.GetEntryAssembly()!
                .GetTypes()
                .Where(t => typeof(IToolPlugin).IsAssignableFrom(t) 
                            && !t.IsAbstract 
                            && !t.IsInterface);    
            foreach (var type in builtInTypes)
            {
                try
                {
                    var instance = (IToolPlugin)Activator.CreateInstance(type)!;
                    var loadedPlugin = new LoadedPlugin
                    {
                        Name = instance.Name,
                        Version = instance.Version,
                        Description = instance.Description,
                        IsBuiltIn = true,
                        Instance = instance,
                        LoadContext = null, // Built-in plugins don't have a separate context
                        LoadedAt = DateTime.UtcNow,
                    };

                    lock (_lock)
                    {
                        _plugins[loadedPlugin.Name] = loadedPlugin;
                    }

                    _logger.LogInformation(
                        "Built-in plugin registered: {Name} v{Version}",
                        instance.Name,
                        instance.Version);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to register built-in plugin: {TypeName}", type.FullName);
                }
            }
        }

        public IEnumerable<LoadedPluginInfo> GetLoadedPlugins()
        {
            lock (_lock)
            {
                return _plugins.Values.Select(p => new LoadedPluginInfo(
                    p.Name,
                    p.Version,
                    p.Description,
                    p.IsBuiltIn,
                    p.LoadedAt
                )).ToList();
            }
        }

        public bool IsLoaded(string name)
        {
            lock (_lock)
            {
                return _plugins.ContainsKey(name);
            }
        }

        public IToolPlugin? GetPluginInstance(string name)
        {
            lock (_lock)
            {
                return _plugins.TryGetValue(name, out var plugin) ? plugin.Instance : null;
            }
        }

        public IEnumerable<IToolPlugin> GetAllInstances()
        {
            lock (_lock)
            {
                return _plugins.Values.Select(p => p.Instance).ToList();
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