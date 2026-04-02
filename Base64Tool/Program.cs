using DITT.SDK.MockHost;
using MyTool;

// ─────────────────────────────────────────────────────
// DITT Mock Host
// Runs a lightweight API server for local plugin development.
// No database, no Docker, no real DITT host required.
//
// Usage:
//   dotnet watch run   → hot-reload on C# changes
//   dotnet run         → single run
// ─────────────────────────────────────────────────────

var app = MockHostBuilder.Create<MyToolPlugin>(args);
app.Run("http://localhost:5000");