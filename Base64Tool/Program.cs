using DITT.SDK.MockHost;
using Base64Tool;

// ─────────────────────────────────────────────────────
// DITT Mock Host
// Runs a lightweight API server for local plugin development.
// No database, no Docker, no real DITT host required.
//
// Usage:
//   dotnet watch run   → hot-reload on C# changes
//   dotnet run         → single run
// ─────────────────────────────────────────────────────

var app = MockHostBuilder.Create<Base64ToolPlugin>(args);
app.Run("http://localhost:5000");