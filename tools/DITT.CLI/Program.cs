using System.CommandLine;
// using DITT.CLI.Commands;

var rootCommand = new RootCommand("DITT CLI - Developer tools for plugin development");

// Add commands
// rootCommand.AddCommand(PackCommand.Create());

return await rootCommand.InvokeAsync(args);