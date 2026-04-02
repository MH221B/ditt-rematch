using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DITT.SDK.MockHost;

/// <summary>
/// Lightweight development host for testing plugins without
/// the full DITT platform, database, or Docker.
/// </summary>
public static class MockHostBuilder
{
    public static WebApplication Create<TPlugin>(string[] args)
        where TPlugin : IToolPlugin, new()
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddCors(options =>
            options.AddPolicy("Dev", policy =>
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()));

        var plugin = new TPlugin();
        plugin.ConfigureServices(builder.Services);

        var app = builder.Build();

        app.UseCors("Dev");

        // Get the plugin's request handler
        var handler = plugin.CreateRequestHandler();

        // Catch-all route: /api/tools/{PluginName}/**
        app.Use(async (context, next) =>
        {
            var path = context.Request.Path.Value ?? "";
            var pluginPrefix = $"/api/tools/{plugin.Name}/";

            if (path.StartsWith(pluginPrefix))
            {
                // Extract the path after /api/tools/{PluginName}/
                var remainingPath = path.Substring(pluginPrefix.Length);
                context.Request.RouteValues["path"] = remainingPath;
                
                await handler(context);
            }
            else
            {
                await next();
            }
        });

        // Info endpoint
        app.MapGet($"/api/mock/info", () => new
        {
            Plugin = plugin.Name,
            Version = plugin.Version,
            Description = plugin.Description
        });

        var logger = app.Services.GetRequiredService<ILogger<WebApplication>>();
        logger.LogInformation("🚀 DITT Mock Host running for plugin: {Name} v{Version}",
            plugin.Name, plugin.Version);
        logger.LogInformation("📋 API info: http://localhost:5000/api/mock/info");

        return app;
    }
}
