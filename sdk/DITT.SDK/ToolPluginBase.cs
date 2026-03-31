// sdk/DITT.SDK/ToolPluginBase.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace DITT.SDK;

/// <summary>
/// Base class for all DITT plugins.
/// Override only what your tool needs.
/// </summary>
public abstract class ToolPluginBase : IToolPlugin
{
    /// <inheritdoc/>
    public abstract string Name { get; }

    /// <inheritdoc/>
    public abstract string Version { get; }

    /// <inheritdoc/>
    public abstract string Description { get; }

    /// <inheritdoc/>
    public virtual bool IsBuiltIn => false;

    /// <inheritdoc/>
    public virtual bool IsPremium => false;

    /// <inheritdoc/>
    /// <remarks>Override to register scoped/singleton services for your tool.</remarks>
    public virtual void ConfigureServices(IServiceCollection services) { }

    /// <inheritdoc/>
    /// <remarks>
    /// Default implementation delegates to <see cref="HandleRequest"/>.
    /// Override CreateRequestHandler() directly for full control,
    /// or override HandleRequest() for simpler path-based routing.
    /// </remarks>
    public virtual RequestDelegate CreateRequestHandler()
    {
        return async (HttpContext context) =>
        {
            var path = context.Request.RouteValues["path"]?.ToString() ?? string.Empty;
            await HandleRequest(context, path);
        };
    }

    /// <summary>
    /// Override this to handle incoming requests for your plugin.
    /// <para>
    /// <paramref name="path"/> is the path segment after /api/tools/{PluginName}/
    /// e.g. for /api/tools/MyTool/run → path = "run"
    /// </para>
    /// Default returns 404 if not overridden.
    /// </summary>
    protected virtual async Task HandleRequest(HttpContext context, string path)
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new
        {
            Message = $"No handler found for path '{path}' in plugin '{Name}'"
        });
    }
}
