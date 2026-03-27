using DITT.Host.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using DotNetEnv;
using DITT.PluginLoader;
using DITT.Host.Services.Interfaces;
using DITT.Host.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
if (File.Exists(".env"))
{
    Env.Load(".env");
}

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
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

// Add database context
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

// CORS — allow Angular dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevPolicy", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Middleware configuration
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
    dbContext.Database.Migrate(); // Apply any pending migrations

    // Register built-in tools on startup
    var pluginManager = app.Services.GetRequiredService<PluginManager>();
    pluginManager.RegisterBuiltInTools();

    //  Sync built-in tools with DB
    var registrationService = scope.ServiceProvider.GetRequiredService<IToolRegistrationService>();

    foreach (var plugin in pluginManager.GetAllInstances())
        await registrationService.RegisterAsync(plugin, isBuiltIn: true);
}

app.Run();
