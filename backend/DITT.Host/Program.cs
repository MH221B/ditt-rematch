using DITT.Host.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using DotNetEnv;
using DITT.PluginLoader;
using DITT.Host.Services.Interfaces;
using DITT.Host.Services;
using DITT.Core.Enums;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
if (File.Exists(".env"))
{
    Env.Load(".env");
}

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Build connection string from environment variables
var host = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "5433";
var database = Environment.GetEnvironmentVariable("DB_NAME") ?? "DITT";
var username = Environment.GetEnvironmentVariable("DB_USER") ?? "postgres";
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

if (string.IsNullOrEmpty(password))
{
    throw new InvalidOperationException("DB_PASSWORD environment variable is not set. Check your .env file.");
}

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var pluginDirectory = builder.Configuration["PluginDirectory"]
    ?? Path.Combine(Directory.GetCurrentDirectory(), "plugins");

builder.Services.AddSingleton(sp =>
    new PluginManager(
        sp.GetRequiredService<ILogger<PluginManager>>(),
        pluginDirectory
    ));

builder.Services.AddScoped<IToolRegistrationService, ToolRegistrationService>();
builder.Services.AddScoped<IPackageService, PackageService>();

// Configure built-in plugins' services before building the app
var tempPluginManager = new PluginManager(
    new Logger<PluginManager>(new LoggerFactory()),
    pluginDirectory
);
tempPluginManager.RegisterBuiltInTools();
foreach (var plugin in tempPluginManager.GetAllInstances())
{
    plugin.ConfigureServices(builder.Services);
}

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// File upload size limit (50MB for packages)
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50MB
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("DevPolicy");
app.UseAuthorization();
app.MapControllers(); 

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();

    var pluginManager = app.Services.GetRequiredService<PluginManager>();
    pluginManager.RegisterBuiltInTools();

    var registrationService = scope.ServiceProvider
        .GetRequiredService<IToolRegistrationService>();

    // Sync built-in tools to DB
    foreach (var plugin in pluginManager.GetAllInstances())
        await registrationService.RegisterAsync(plugin, isBuiltIn: true);

    // Reload uploaded plugins from disk on startup
    var uploadedTools = await dbContext.Tools
        .Where(t => !t.IsBuiltIn && t.Status == ToolStatus.Active)
        .ToListAsync();

    foreach (var tool in uploadedTools)
    {
        var dllPath = Path.Combine(pluginDirectory, tool.Name, $"{tool.Name}.dll");

        if (File.Exists(dllPath))
        {
            await pluginManager.LoadPluginAsync(dllPath);
            Console.WriteLine($"♻️ Reloaded plugin: {tool.Name}");
        }
        else
        {
            tool.Status = ToolStatus.Inactive;
            Console.WriteLine($"⚠️ Plugin DLL missing: {tool.Name}");
        }
    }

    await dbContext.SaveChangesAsync();
}

app.Run();
