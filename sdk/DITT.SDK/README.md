# DITT SDK

Build plugins for the **DITT** (Developer IT Tools) platform.

---

## Quick Start

### 1. Install the template
dotnet new install ./path/to/templates/ditt-tool

### 2. Scaffold a new plugin
dotnet new ditt-tool -n MyTool --Description "Does something useful"

### 3. Build your plugin
cd MyTool
dotnet build

### 4. Upload the DLL
POST /api/plugins/upload → MyTool.dll

---

## Plugin Anatomy

MyTool/
├── MyTool.csproj          ← References DITT.SDK
├── MyToolPlugin.cs        ← Entry point (IToolPlugin)
├── MyToolService.cs       ← Business logic
└── AngularComponent/      ← Frontend UI
    ├── tool.component.ts

---

## IToolPlugin Contract

| Member               | Required | Description                        |
|----------------------|----------|------------------------------------|
| Name                 | ✅       | Unique tool name                   |
| Version              | ✅       | Semantic version e.g. "1.0.0"      |
| Description          | ✅       | Short description                  |
| IsBuiltIn            | ❌       | Default false — don't override     |
| IsPremium            | ❌       | Default false                      |
| ConfigureServices()  | ❌       | Register DI services               |
| ConfigureEndpoints() | ✅       | Register API endpoints             |

---

## Endpoint Convention

All endpoints must be under:
  /api/tools/{YourToolName}/

Example:
  GET  /api/tools/MyTool/info
  POST /api/tools/MyTool/run

---

## ToolResponse<T>

Always wrap responses in ToolResponse<T>:

return Results.Ok(ToolResponse<string>.Ok("result"));
return Results.BadRequest(ToolResponse<string>.Fail("error message"));

---

## Design Tokens

Use these CSS variables in your Angular component
to match the DITT host UI:

--primary-color      #088395
--secondary-color    #37B7C3
--background-color   #071952
--secondary-color-1  #0A2463
--secondary-color-2  #2A9DAF
--text-color         #EBF4F6