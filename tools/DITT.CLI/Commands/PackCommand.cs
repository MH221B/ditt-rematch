using System.CommandLine;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text.Json;
using DITT.SDK.Packaging;

namespace DITT.CLI.Commands;

public static class PackCommand
{
    // public static Command Create()
    // {
    //     var command = new Command("pack", "Package a plugin into .mtpkg format");

    //     var outputOption = new Option<string?>(
    //         "--output",
    //         "Output directory for the .mtpkg file"
    //     );

    //     var authorOption = new Option<string?>(
    //         "--author",
    //         "Author Name (optional)"
    //     );

    //     command.AddOption(outputOption);
    //     command.AddOption(authorOption);

    //     command.SetHandler(async (output, author) =>
    //     {
    //         await ExecutePack(output, author);
    //     }, outputOption, authorOption);

    //     return command;
    // }

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