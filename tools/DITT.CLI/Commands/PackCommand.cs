using System.CommandLine;
using System.Diagnostics;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using DITT.SDK.Packaging;

namespace DITT.CLI.Commands;

public static class PackCommand
{
    public static Command Create()
    {
        var command = new Command("pack", "Package a plugin into .mtpkg format");

        var outputOption = new Option<string?>(
            "--output",
            "Output directory for the .mtpkg file"
        );

        var authorOption = new Option<string?>(
            "--author",
            "Author Name (optional)"
        );

        command.AddOption(outputOption);
        command.AddOption(authorOption);

        command.SetHandler(async (output, author) =>
        {
            await ExecutePack(output, author);
        }, outputOption, authorOption);

        return command;
    }
    private static async Task ExecutePack(string? outputDir, string? author)
    {
        var currentDir = Directory.GetCurrentDirectory();
        Console.WriteLine($"Packing plugin from: {currentDir}");

        //  Find .csproj file
        var csprojFiles = Directory.GetFiles(currentDir, "*.csproj");
        if (csprojFiles.Length == 0)
        {
            Console.WriteLine("No .csproj file found in the current directory");
        }

        var csprojPath = csprojFiles[0];
        var projectName = Path.GetFileNameWithoutExtension(csprojPath);

        // Build the project
        Console.WriteLine("Building project...");
        var buildResult = await RunDotnetCommand($"build {csprojPath} -c Release");
        if (buildResult == 0)
        {
            Console.WriteLine("Build failed");
            Environment.Exit(1);
        }

        // Find the plugin DLL
        var binPath = Path.Combine(currentDir, "bin", "Release", "net9.0");
        var dllPath = Path.Combine(binPath, $"{projectName}.dll");

        if (!File.Exists(dllPath))
        {
            Console.WriteLine($"Plugin DLL not found: {dllPath}");
            Environment.Exit(1);
        }

        // Load plugin to get metadata
        Console.WriteLine("Reading plugin metadata...");
        var (name, version, description, isPremium) = await GetPluginMetadata(dllPath);

        // Check for frontend bundle
        string? frontendBundle = null;
        var frontendPath = Path.Combine(currentDir, "Frontend", "preview", "plugin-bundle.js");
        if (File.Exists(frontendPath))
        {
            Console.WriteLine("Frontend bundle found");
            frontendBundle = "frontend/plugin-bundle.js";
        }

        // Create manifest
        var manifest = new PluginManifest
        {
            Name = name,
            Version = version,
            Description = description,
            Author = author ?? string.Empty,
            IsPremium = isPremium,
            PluginDll = $"{projectName}.dll",
            FrontendBundle = frontendBundle,
            DllHash = CalculateSha256(dllPath),
            CreatedAt = DateTime.UtcNow
        };

        // Create .mtpkg file
        outputDir ??= currentDir;
        var packagePath = Path.Combine(outputDir, $"{projectName}.{version}.mtpkg");

        Console.WriteLine($"Creating package: {packagePath}");
        await CreatePackage(packagePath, manifest, dllPath, frontendPath);

        Console.WriteLine($"Package created successfully: {Path.GetFileName(packagePath)}");
        Console.WriteLine($"Size: {new FileInfo(packagePath).Length / 1024:N0} KB");
    }

    private static async Task<int> RunDotnetCommand(string arguments)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            }
        };

        process.Start();
        await process.WaitForExitAsync();
        return process.ExitCode;
    }

    private static async Task<(string name, string version, string description, bool isPremium)> GetPluginMetadata(string dllPath)
    {
        // Load assembly and find IToolPlugin implementation
        var assembly = System.Reflection.Assembly.LoadFrom(dllPath);
        var pluginType = assembly.GetTypes()
            .FirstOrDefault(t => t.GetInterfaces()
                .Any(i => i.Name == "IToolPlugin"));

        if (pluginType == null)
        {
            throw new InvalidOperationException("No IToolPlugin implementation found");
        }

        var plugin = Activator.CreateInstance(pluginType) as dynamic;
        
        if (plugin == null)
        {
            throw new InvalidOperationException("Failed to instantiate IToolPlugin");
        }
        
        return (plugin.Name, plugin.Version, plugin.Description, plugin.IsPremium);
    }
    private static string CalculateSha256(string filePath)
    {
        using var sha256 = SHA256.Create();
        using var stream = File.OpenRead(filePath);
        var hash = sha256.ComputeHash(stream);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static async Task CreatePackage(string packagePath, PluginManifest manifest,
        string dllPath, string? frontendPath)
    {
        using var fileStream = new FileStream(packagePath, FileMode.Create);
        using var archive = new ZipArchive(fileStream, ZipArchiveMode.Create);

        // Add manifest.json
        var manifestEntry = archive.CreateEntry("manifest.json");
        using (var manifestStream = manifestEntry.Open())
        {
            var manifestJson = JsonSerializer.Serialize(manifest, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            await manifestStream.WriteAsync(System.Text.Encoding.UTF8.GetBytes(manifestJson));
        }

        // Add plugin DLL
        var dllEntry = archive.CreateEntry(manifest.PluginDll);
        using (var dllStream = dllEntry.Open())
        using (var dllFile = File.OpenRead(dllPath))
        {
            await dllFile.CopyToAsync(dllStream);
        }

        // Add frontend bundle if exists
        if (frontendPath != null && File.Exists(frontendPath))
        {
            var frontendEntry = archive.CreateEntry("frontend/plugin-bundle.js");
            using var frontendStream = frontendEntry.Open();
            using var frontendFile = File.OpenRead(frontendPath);
            await frontendFile.CopyToAsync(frontendStream);
        }
    }

}