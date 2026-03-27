namespace DITT.Core.Models
{
    public interface IPluginManager
    {
        Task<ValidationResult> LoadPluginAsync(string dllPath);
        void UnloadPlugin(string name);
        void RegisterBuiltInTools();
        IEnumerable<LoadedPluginInfo> GetLoadedPlugins();
        bool IsLoaded(string name);
    }
}

public record LoadedPluginInfo(
    string Name,
    string Version,
    string Description,
    bool IsBuiltIn,
    DateTime LoadedAt
);