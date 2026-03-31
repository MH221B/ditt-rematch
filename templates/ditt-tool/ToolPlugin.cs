// templates/ditt-tool/ToolPlugin.cs
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using DITT.SDK;

namespace ToolTemplate;

/// <summary>
/// Entry point for the ToolTemplate plugin.
/// DITT discovers this class automatically on load.
/// </summary>
public class ToolTemplatePlugin : ToolPluginBase
{
    public override string Name        => "ToolTemplate";
    public override string Version     => "TOOL_VERSION";
    public override string Description => "TOOL_DESCRIPTION";
    public override bool   IsPremium   => false; // Set to true for premium tools

    /// <summary>
    /// Register services your tool needs.
    /// They will be available via DI in your endpoint handlers.
    /// </summary>
    public override void ConfigureServices(IServiceCollection services)
    {
        services.AddScoped<ToolTemplateService>();
    }

    /// <summary>
    /// Handle all incoming requests for this plugin.
    /// Convention: /api/tools/ToolTemplate/{action}
    /// </summary>
    protected override async Task HandleRequest(HttpContext context, string path)
    {
        switch (path)
        {
            case "info":
                if (!HttpMethods.IsGet(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await context.Response.WriteAsJsonAsync(
                    ToolResponse<object>.Ok(new { Name, Version, Description }));
                break;

            case "run":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                var input = await context.Request.ReadFromJsonAsync<ToolTemplateRequest>();
                if (input is null || string.IsNullOrWhiteSpace(input.Value))
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsJsonAsync(
                        ToolResponse<string>.Fail("Input value is required"));
                    break;
                }
                var result = new ToolTemplateService().Process(input.Value);
                await context.Response.WriteAsJsonAsync(ToolResponse<string>.Ok(result));
                break;

            default:
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = $"Route '{path}' not found in {Name}"
                });
                break;
        }
    }
}

/// <summary>Request model for the run endpoint.</summary>
public record ToolTemplateRequest(string Value);
