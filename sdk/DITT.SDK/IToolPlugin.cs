// sdk/DITT.SDK/IToolPlugin.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace DITT.SDK;

/// <summary>
/// Core interface every DITT plugin must implement.
/// Prefer inheriting <see cref="ToolPluginBase"/> instead
/// of implementing this directly.
/// </summary>
public interface IToolPlugin
{
    /// <summary>Unique display name of the tool. Must be unique across all loaded plugins.</summary>
    string Name { get; }

    /// <summary>Semantic version string e.g. "1.0.0"</summary>
    string Version { get; }

    /// <summary>Short description shown in the sidebar and tool list.</summary>
    string Description { get; }

    /// <summary>True if this tool ships with the platform. False for uploaded plugins.</summary>
    bool IsBuiltIn { get; }

    /// <summary>True if this tool is a premium feature. False for free tools.</summary>
    bool IsPremium { get; }

    /// <summary>
    /// Register any services your tool needs into the DI container.
    /// Called once at startup/load time.
    /// </summary>
    void ConfigureServices(IServiceCollection services);

    /// <summary>
    /// Returns a RequestDelegate that handles all HTTP requests for this plugin.
    /// The host dispatches requests to /api/tools/{PluginName}/** here at runtime.
    /// </summary>
    RequestDelegate CreateRequestHandler();
}
