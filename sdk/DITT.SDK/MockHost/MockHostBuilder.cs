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

        // Allow Angular preview shell to call the API
        builder.Services.AddCors(options =>
            options.AddPolicy("Dev", policy =>
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()));

        // Register plugin services
        var plugin = new TPlugin();
        plugin.ConfigureServices(builder.Services);

        var app = builder.Build();

        app.UseCors("Dev");

        // Map plugin endpoints under /api/tools/{PluginName}/{path}
        var handler = plugin.CreateRequestHandler();

        app.Map($"/api/tools/{plugin.Name}/{{path}}", handler);
        app.Map($"/api/tools/{plugin.Name}", handler);

        // Info endpoint — always available
        app.MapGet($"/api/mock/info", () => new
        {
            Plugin = plugin.Name,
            Version = plugin.Version,
            Description = plugin.Description,
            Endpoints = new[]
            {
                $"GET  /api/tools/{plugin.Name}/info",
                $"POST /api/tools/{plugin.Name}/run"
            }
        });

        var logger = app.Services.GetRequiredService<ILogger<WebApplication>>();
        logger.LogInformation("🚀 DITT Mock Host running for plugin: {Name} v{Version}",
            plugin.Name, plugin.Version);
        logger.LogInformation("📋 API info: <http://localhost:5000/api/mock/info>");

        return app;
    }
}