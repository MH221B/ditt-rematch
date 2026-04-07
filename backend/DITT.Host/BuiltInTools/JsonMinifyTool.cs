using DITT.SDK;
using System.Text.Json;

namespace DITT.Host.BuiltInTools;

public class JsonMinifyTool : ToolPluginBase
{
    public override string Name => "JsonMinify";
    public override string Version => "1.0.0";
    public override string Description => "Minify and compress your JSON by removing unnecessary whitespace.";
    public override bool IsBuiltIn => true;

    protected override async Task HandleRequest(HttpContext context, string path)
    {
        switch (path)
        {
            case "minify":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await HandleMinify(context);
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
                    Description,
                    IsBuiltIn
                });
                break;

            default:
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = $"Route '{path}' not found in {Name}. Available routes: /minify, /info"
                });
                break;
        }
    }

    private async Task HandleMinify(HttpContext context)
    {
        try
        {
            using var reader = new StreamReader(context.Request.Body);
            var requestBody = await reader.ReadToEndAsync();

            if (string.IsNullOrWhiteSpace(requestBody))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = "Request body is empty. Please provide valid JSON."
                });
                return;
            }

            // Parse the request body to extract rawJson field
            using var requestDocument = JsonDocument.Parse(requestBody);
            if (!requestDocument.RootElement.TryGetProperty("rawJson", out var rawJsonElement))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = "Request body must contain 'rawJson' field"
                });
                return;
            }

            var jsonInput = rawJsonElement.GetString();

            if (string.IsNullOrWhiteSpace(jsonInput))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = "rawJson field is empty. Please provide valid JSON."
                });
                return;
            }

            using var document = JsonDocument.Parse(jsonInput);
            var minified = JsonSerializer.Serialize(
                document.RootElement,
                new JsonSerializerOptions { WriteIndented = false }
            );

            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                minified,
                originalSize = jsonInput.Length,
                minifiedSize = minified.Length,
                compressionRatio = Math.Round(
                    ((double)(jsonInput.Length - minified.Length) / jsonInput.Length) * 100, 2
                )
            });
        }
        catch (JsonException ex)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = "Invalid JSON provided",
                Error = ex.Message
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = "An error occurred while processing your request",
                Error = ex.Message
            });
        }
    }
}
