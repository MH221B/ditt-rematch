using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace DITT.SDK;

public abstract class ToolPluginBase : IToolPlugin
{
    public abstract string Name { get; }
    public abstract string Version { get; }
    public abstract string Description { get; }
    public virtual bool IsBuiltIn => false;
    public virtual bool IsPremium => false;

    public virtual void ConfigureServices(IServiceCollection services) { }

    public virtual RequestDelegate CreateRequestHandler()
    {
        return async (HttpContext context) =>
        {
            var path = context.Request.RouteValues["path"]?.ToString() ?? string.Empty;
            await HandleRequest(context, path);
        };
    }

    // ✅ Developer overrides this
    protected virtual async Task HandleRequest(HttpContext context, string path)
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new
        {
            Message = $"No handler found for path '{path}' in plugin '{Name}'"
        });
    }
}