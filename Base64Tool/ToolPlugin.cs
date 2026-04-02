// templates/ditt-tool/ToolPlugin.cs
using Microsoft.AspNetCore.Http;
using DITT.SDK;

namespace MyTool;

/// <summary>
/// Entry point for the MyTool plugin.
/// DITT discovers this class automatically on load.
/// </summary>
public class Base64ToolPlugin : ToolPluginBase
{
    public override string Name        => "Base64 string encoder/decoder";
    public override string Version     => "1.0.0";
    public override string Description => "Simply encode and decode strings into their base64 representation.";
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
        var input = await context.Request.ReadFromJsonAsync<MyToolRequest>();

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
            Result = $"MyTool processed: {input.Value}"
        });
    }
}

/// <summary>Request model for the run endpoint.</summary>
public record MyToolRequest(string Value);
