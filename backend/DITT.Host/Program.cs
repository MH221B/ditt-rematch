using DITT.Host.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using DotNetEnv;
using DITT.PluginLoader;
using DITT.Host.Services.Interfaces;
using DITT.Host.Services;
using DITT.Core.Enums;
using DITT.Core.Models;
using Microsoft.AspNetCore.Http.Features;
using System.Reflection;
using DITT.SDK;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
if (File.Exists(".env"))
{
    Env.Load(".env");
}

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
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

// Identity configuration
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Add JWT authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT_KEY environment variable is not set. Check your .env file.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            ValidateAudience = true,
            ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var pluginDirectory = builder.Configuration["PluginDirectory"]
    ?? Path.Combine(Directory.GetCurrentDirectory(), "plugins");

builder.Services.AddSingleton(sp =>
    new PluginManager(
        sp.GetRequiredService<ILogger<PluginManager>>(),
        pluginDirectory
    ));

builder.Services.AddScoped<IToolRegistrationService, ToolRegistrationService>();
builder.Services.AddScoped<IPackageService, PackageService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure built-in plugins' services before building the app
var builtInTypes = Assembly.GetEntryAssembly()!
    .GetTypes()
    .Where(t => typeof(IToolPlugin).IsAssignableFrom(t) 
                && !t.IsAbstract 
                && !t.IsInterface);

foreach (var type in builtInTypes)
{
    var instance = (IToolPlugin)Activator.CreateInstance(type)!;
    instance.ConfigureServices(builder.Services);
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers(); 

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();

    // Seed default roles
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var roles = new[] { "User", "PremiumUser", "Admin" };
    
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    var pluginManager = app.Services.GetRequiredService<PluginManager>();
    pluginManager.RegisterBuiltInTools();

    var registrationService = scope.ServiceProvider
        .GetRequiredService<IToolRegistrationService>();

    // Sync built-in tools to DB
    foreach (var plugin in pluginManager.GetAllInstances())
        await registrationService.RegisterAsync(plugin, isBuiltIn: true);

    // Reload installed packages from disk on startup
    var packageService = scope.ServiceProvider.GetRequiredService<IPackageService>();
    var installedPackages = await dbContext.PluginPackages
        .Where(p => p.Status == PackageStatus.Installed)
        .ToListAsync();

    foreach (var package in installedPackages)
    {
        try
        {
            // Extract manifest to get DLL path
            var manifest = await packageService.ExtractManifestFromPackageAsync(package.PackagePath);
            var dllPath = Path.Combine(package.PackagePath, manifest.PluginDll);

            if (File.Exists(dllPath))
            {
                var loadResult = await pluginManager.LoadPluginAsync(dllPath);
                if (loadResult.IsValid)
                {
                    Console.WriteLine($"♻️ Reloaded plugin: {package.Name}");

                    // Get the loaded plugin instance and register it with package info
                    var plugin = pluginManager.GetAllInstances()
                        .FirstOrDefault(p => p.Name == loadResult.LoadedPluginName);
                    
                    if (plugin != null)
                    {
                        await registrationService.RegisterAsync(
                            plugin,
                            isBuiltIn: false,
                            frontendBundlePath: package.FrontendBundlePath,
                            packageId: package.Id
                        );
                        Console.WriteLine($"📦 Registered startup plugin: {package.Name} with PackageId {package.Id}");
                    }
                }
                else
                {
                    package.Status = PackageStatus.Failed;
                    Console.WriteLine($"⚠️ Plugin validation failed for {package.Name}: {string.Join(", ", loadResult.Errors)}");
                }
            }
            else
            {
                package.Status = PackageStatus.Failed;
                Console.WriteLine($"⚠️ Plugin DLL missing for {package.Name}: {dllPath}");
            }
        }
        catch (Exception ex)
        {
            package.Status = PackageStatus.Failed;
            Console.WriteLine($"❌ Error reloading package {package.Name}: {ex.Message}");
        }
    }

    await dbContext.SaveChangesAsync();
}

app.Run();
