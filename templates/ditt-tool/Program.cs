using DITT.SDK.MockHost;
using ToolTemplate;

// ─────────────────────────────────────────────────────
// DITT Mock Host
// Runs a lightweight API server for local plugin development.
// No database, no Docker, no real DITT host required.
//
// Usage:
//   dotnet watch run   → hot-reload on C# changes
//   dotnet run         → single run
// ─────────────────────────────────────────────────────

var app = MockHostBuilder.Create<ToolTemplatePlugin>(args);
app.Run("http://localhost:5000");