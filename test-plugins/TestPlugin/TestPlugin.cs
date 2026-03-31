using DITT.SDK;
using Microsoft.AspNetCore.Http;

namespace TestPlugin;

public class TestPlugin : ToolPluginBase
{
    public override string Name => "TestPlugin";
    public override string Version => "1.0.0";
    public override string Description => "A simple test plugin.";

    protected override async Task HandleRequest(HttpContext context, string path)
    {
        switch (path)
        {
            case "hello":
                if (!HttpMethods.IsGet(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = "Hello from TestPlugin!",
                    Timestamp = DateTime.UtcNow
                });
                break;

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
