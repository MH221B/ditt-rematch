// templates/ditt-tool/ToolPlugin.cs
using Microsoft.AspNetCore.Http;
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
    public override bool   IsPremium   => false;

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
                await context.Response.WriteAsJsonAsync(new
                {
                    Name,
                    Version,
                    Description
                });
                break;

            case "run":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await HandleRun(context);
                break;

            default:
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = $"Route '{path}' not found in {Name}. Available routes: /info, /run"
                });
                break;
        }
    }

    private async Task HandleRun(HttpContext context)
    {
        // TODO: Replace with your tool logic
        var input = await context.Request.ReadFromJsonAsync<ToolTemplateRequest>();

        if (input is null || string.IsNullOrWhiteSpace(input.Value))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = "Input value is required"
            });
            return;
        }

        await context.Response.WriteAsJsonAsync(new
        {
            Result = $"ToolTemplate processed: {input.Value}"
        });
    }
}

/// <summary>Request model for the run endpoint.</summary>
public record ToolTemplateRequest(string Value);
