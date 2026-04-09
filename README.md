# DITT - Developer IT Tools

A modern, extensible platform for building and hosting developer utility plugins. DITT provides a complete ecosystem for creating, packaging, and managing plugins with both backend APIs and interactive frontends.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build & Run](#build--run)
- [Database Setup](#database-setup)
- [Plugin Development](#plugin-development)
- [Development Workflows](#development-workflows)

---

## Project Overview

**DITT** is a plugin platform designed to simplify the creation and deployment of developer tools. It provides:

- **Backend Host** — ASP.NET Core service that manages plugins, authentication, and API endpoints
- **Frontend Shell** — Angular application with Module Federation for dynamic plugin UI loading
- **Plugin SDK** — .NET SDK for building plugins with full feature support
- **CLI Tool** — Command-line interface for packaging and managing plugins
- **Built-in Tools** — Example plugins (Base64 encoding, JSON utilities, etc.)

Developers can create plugins by implementing the `IToolPlugin` interface, build a frontend UI component (optional), and package everything as a plugin bundle. The platform handles plugin discovery, loading, and lifecycle management.

---

## Project Structure

```
ditt-rematch/
├── backend/                    # ASP.NET Core backend
│   ├── DITT.Core/             # Core models, enums, interfaces
│   ├── DITT.Host/             # Main host application (API, auth, plugin management)
│   ├── DITT.PluginLoader/     # Plugin discovery and assembly loading
│   └── DITT.Tests/            # Unit tests
├── frontend/                   # Angular frontend shell
│   ├── src/
│   │   ├── app/               # Angular components and services
│   │   ├── environments/       # Environment configuration
│   │   └── main.ts            # Bootstrap entry point
│   ├── angular.json           # Angular CLI configuration
│   └── package.json           # Frontend dependencies
├── sdk/
│   └── DITT.SDK/              # NuGet package for plugin development
│       ├── IToolPlugin.cs     # Plugin interface contract
│       └── ToolPluginBase.cs  # Base class for plugins
├── tools/
│   └── DITT.CLI/              # Command-line tool for packaging plugins
├── templates/
│   └── ditt-tool/             # dotnet template for scaffolding new plugins
├── Base64Tool/                # Example plugin (Base64 encoding/decoding)
│   ├── Base64Tool.csproj      # Plugin C# project
│   └── Frontend/              # Angular component for plugin UI
├── test-plugins/              # Additional test plugins
└── scripts/
    ├── setup-mtp.js           # One-time setup script
    └── run-mtp.js             # Plugin management CLI
```

### Key Components

| Component | Purpose | Language |
|-----------|---------|----------|
| [DITT.Core](backend/DITT.Core/) | Shared models, enums, validation | C# |
| [DITT.Host](backend/DITT.Host/) | API server, plugin hosting, auth | C# + ASP.NET Core |
| [DITT.PluginLoader](backend/DITT.PluginLoader/) | Assembly loading, plugin discovery | C# |
| [DITT.SDK](sdk/DITT.SDK/) | NuGet package for building plugins | C# |
| [DITT.CLI](tools/DITT.CLI/) | Packaging and plugin management tool | C# |
| [Frontend Shell](frontend/) | Web UI, module federation host | Angular 19 + TypeScript |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Shell (Angular)                     │
│  - Bootstrap: index.html → main.ts → bootstrap.ts              │
│  - Module Federation Host (MFE framework)                       │
│  - Dynamically loads plugin components at runtime               │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend API (ASP.NET Core)                     │
│  - Controllers: Auth, Health, Packages, Tools                  │
│  - Plugin management endpoints                                  │
│  - Bundle serving: /api/packages/{id}/bundle/{**path}          │
│  - Database: PostgreSQL via EF Core                            │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Plugin System (Runtime Assembly Loading)           │
│  - PluginManager discovers and loads DLL assemblies             │
│  - Each plugin implements IToolPlugin                           │
│  - Plugin DI container for ConfigureServices()                  │
│  - Custom AssemblyLoadContext per plugin                       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│        Static Assets & Bundles (Module Federation)              │
│  - Plugin bundles served from: /frontend/plugin-bundle.js       │
│  - MIME types auto-detected, JS files served correctly          │
│  - Plugins bootstrap as Angular Elements or MFE modules         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend requests** → Backend API (`/api/...`)
2. **Backend loads plugins** → PluginManager discovers DLLs
3. **Plugin registration** → Each plugin configures endpoints via `ConfigureEndpoints()`
4. **Frontend loads bundle** → Requests JS from `/api/packages/{id}/bundle/plugin-bundle.js`
5. **Module Federation** → Host shell loads and instantiates plugin component

---

## Prerequisites

Ensure you have installed:

- **.NET SDK** — Version 9.0 or later ([download](https://dotnet.microsoft.com/download))
- **Node.js** — Version 18+ and npm ([download](https://nodejs.org))
- **PostgreSQL** — Version 13+ ([download](https://www.postgresql.org/download))
- **Git** — For version control

Verify installations:
```bash
dotnet --version      # e.g., 9.0.0
node --version        # e.g., v18.20.0
npm --version         # e.g., 9.8.1
psql --version        # e.g., psql 13.20
```

---

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ditt-rematch
```

### 2. Run Setup Script

```bash
npm run setup
```

This script:
- Packs the SDK and CLI as NuGet packages
- Installs the DITT.CLI as a global dotnet tool
- Outputs binaries to `tools/bin`

### 3. Configure Database (PostgreSQL)

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=DITT
DB_USER=postgres
DB_PASSWORD=your_password_here
```

Ensure PostgreSQL is running and the credentials are correct.

### 4. Install Dependencies

```bash
# Backend dependencies are managed by NuGet (automatic)

# Frontend dependencies
npm --prefix frontend install
```

### 5. Start Development

**Backend:**
```bash
npm run backend:watch
```
Server runs on `http://localhost:5000` with OpenAPI docs at `/api/docs`

**Frontend (in another terminal):**
```bash
npm run frontend:serve
```
Frontend runs on `http://localhost:4200`

Open `http://localhost:4200` in your browser.

---

## Build & Run

### Available npm Scripts

```bash
# Setup (one-time)
npm run setup                     # Install SDK, CLI, and build tools

# Backend
npm run backend:run              # Run backend once
npm run backend:watch            # Run backend with auto-reload on changes

# Frontend
npm run frontend:serve           # Serve frontend for development
npm run frontend:build           # Build frontend for production

# Plugin management
npm run mtp                      # Run MTP (plugin management) commands
npm run mtp:pack [plugin-name]   # Package a plugin
npm run mtp:info                 # Show MTP help
```

### Manual Build

```bash
# Build entire solution
dotnet build DITT.sln

# Build specific project
dotnet build backend/DITT.Host/DITT.Host.csproj

# Run tests
dotnet test DITT.Tests.csproj
```

### Frontend Build

```bash
cd frontend
ng build --configuration production
```

Output: `frontend/dist/ditt/` — Ready for deployment.

---

## Database Setup

DITT uses **PostgreSQL** for data persistence (user accounts, plugin metadata, configurations).

### Initial Setup

1. **Install PostgreSQL** and start the service
2. **Create a database:**
   ```bash
   createdb -U postgres DITT
   ```
3. **Configure `.env`** (see Quick Start section)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL server address | `localhost` |
| `DB_PORT` | PostgreSQL server port | `5433` |
| `DB_NAME` | Database name | `DITT` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | *(required)* |

### Migrations

When you run the backend for the first time, Entity Framework Core will automatically apply pending migrations if configured. To manually apply migrations:

```bash
dotnet ef database update --project backend/DITT.Host
```

To create a new migration:

```bash
dotnet ef migrations add MigrationName --project backend/DITT.Host
```

---

## Plugin Development

### Using the Template

#### 1. Install the Template

```bash
dotnet new install ./templates/ditt-tool
```

#### 2. Create a New Plugin

```bash
dotnet new ditt-tool -n MyPlugin --Description "My awesome plugin"
cd MyPlugin
```

#### 3. Implement the Plugin

Edit `MyPluginPlugin.cs` to implement `IToolPlugin`:

```csharp
using DITT.SDK;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

public class MyPluginPlugin : ToolPluginBase
{
    public override string Name => "myPlugin";
    public override string Version => "1.0.0";
    public override string Description => "My awesome plugin";

    public override void ConfigureServices(IServiceCollection services)
    {
        // Register services for dependency injection
        services.AddScoped<IMyService, MyService>();
    }

    public override void ConfigureEndpoints(WebApplication app)
    {
        // Register API endpoints
        app.MapGet("/api/tools/{toolId}/hello", () => "Hello from MyPlugin!");
    }
}
```

#### 4. Build the Plugin

```bash
dotnet build
```

#### 5. Package and Upload

From the plugin source directory:

```bash
npm run mtp:pack
```

This generates `.mtpkg` file. Upload it via the backend API:

```bash
curl -X POST -F "file=@MyPlugin.1.0.0.mtpkg" \
  https://localhost:5000/api/plugins/upload
```

### Plugin Structure

```
MyPlugin/
├── MyPlugin.csproj              # References DITT.SDK
├── MyPluginPlugin.cs            # IToolPlugin implementation
├── Services/
│   └── IMyService.cs            # Business logic interfaces
├── Frontend/                     # Optional Angular component
│   ├── my-plugin.component.ts
│   └── my-plugin.component.html
├── bin/
│   └── Release/MyPlugin.dll     # Packaged output
└── README.md
```

### IToolPlugin Contract

| Member | Required | Description |
|--------|----------|-------------|
| `Name` | ✅ | Unique tool identifier (lowercase, dash-separated) |
| `Version` | ✅ | Semantic version (e.g., "1.0.0") |
| `Description` | ✅ | Short text describing the tool |
| `IsBuiltIn` | ❌ | Default: false — leave as is |
| `IsPremium` | ❌ | Default: false |
| `ConfigureServices()` | ❌ | Register DI services; called at startup |
| `ConfigureEndpoints()` | ✅ | Register API endpoints for this tool |

### Example Plugin

See [Base64Tool](Base64Tool/) for a complete, working example with:
- Backend implementation (encode/decode endpoints)
- Frontend Angular component
- Webpack packaging configuration

---

## Development Workflows

### Backend Development

Use **dotnet watch** for auto-reload on file changes:

```bash
npm run backend:watch
```

- Edit C# files → Automatic recompilation and restart
- Changes take effect without manual restart
- Logs appear in terminal

### Frontend Development

Use **Angular CLI** for live development server:

```bash
npm run frontend:serve
```

- Edit TypeScript/HTML/CSS → Instant hot-reload
- Browser auto-refreshes on changes
- Available at `http://localhost:4200`

### Plugin Development & Testing

Develop locally, then upload:

```bash
# Build plugin
cd MyPlugin
dotnet build

# Package plugin
cd ..
npm run mtp:pack MyPlugin

# Upload to backend
curl -X POST -F "file=@MyPlugin.1.0.0.mtpkg" \
  http://localhost:5000/api/plugins/upload
```

Refresh frontend to see plugin appear in the UI.

### Debugging

**Backend:**
```bash
# Run with debugger attached (in VS Code, use debug config)
dotnet watch --project backend/DITT.Host run
```

**Frontend:**
- Open Chrome DevTools (`F12`)
- Use Angular DevTools extension for component debugging

### Database Inspection

```bash
# Connect to PostgreSQL
psql -U postgres -d DITT

# View tables
\dt

# Query data
SELECT * FROM plugins;
```

Or use a GUI like pgAdmin or DBeaver for easier navigation.

---

## Common Issues

### Plugin not loading

- **Symptom:** Plugin uploaded but doesn't appear in UI
- **Check:**
  1. Backend logs for load errors
  2. Plugin bundle at `/frontend/plugin-bundle.js`
  3. `.mtpkg` file validity (is a ZIP with correct structure)

### Database connection failed

- **Symptom:** `"DB_PASSWORD environment variable is not set"`
- **Fix:** Ensure `.env` file exists in project root with all required variables

### Frontend can't reach backend

- **Symptom:** CORS errors, API calls fail
- **Check:**
  1. Backend is running (`npm run backend:watch`)
  2. CORS is configured in `Program.cs`
  3. Frontend proxy is configured in `angular.json` for dev server

---

## Contributing

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Commit: `git commit -m "Add my feature"`
5. Push and create a pull request

---

## License

[Add License Info Here]

---

## Support

For issues, questions, or contributions, open an issue or discussion in the repository.

