using DITT.SDK;

namespace DITT.PluginLoader
{
    /// <summary>
    /// Represents a plugin that has been loaded into memory
    /// Holds both the plugin instance and its load context
    /// so we can properly unload it later
    /// </summary>
    public class LoadedPlugin
    {
        public string Name { get; init;} = string.Empty;
        public string Version { get; init;} = string.Empty;
        public string Description { get; init;} = string.Empty;
        public bool IsBuiltIn { get; init;}
        public IToolPlugin Instance { get; init;} = null!;
        public PluginLoadContext? LoadContext { get; init;}  // Will be null for built-in plugins since they are loaded in the default context
        public DateTime LoadedAt { get; init;} = DateTime.UtcNow;
        public string? DllPath { get; init;}
    }
}