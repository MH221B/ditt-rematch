// plugins/Base64Tool/Base64ToolPlugin.cs
using Microsoft.AspNetCore.Http;
using DITT.SDK;
using System.Text;

namespace Base64Tool;

/// <summary>
/// Entry point for the Base64Tool plugin.
/// DITT discovers this class automatically on load.
/// </summary>
public class Base64ToolPlugin : ToolPluginBase
{
    public override string Name        => "Base64Tool";
    public override string Version     => "1.0.0";
    public override string Description => "Encode and decode Base64 strings";
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

            case "encode":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await HandleEncode(context);
                break;

            case "decode":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { Message = "Method not allowed" });
                    break;
                }
                await HandleDecode(context);
                break;

            default:
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new
                {
                    Message = $"Route '{path}' not found in {Name}. Available routes: /info, /encode, /decode"
                });
                break;
        }
    }

    private async Task HandleEncode(HttpContext context)
    {
        var input = await context.Request.ReadFromJsonAsync<Base64Request>();

        if (input is null || string.IsNullOrWhiteSpace(input.Value))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = "Input value is required"
            });
            return;
        }

        try
        {
            var bytes = Encoding.UTF8.GetBytes(input.Value);
            var encoded = Convert.ToBase64String(bytes);

            await context.Response.WriteAsJsonAsync(new
            {
                Success = true,
                Original = input.Value,
                Encoded = encoded,
                OriginalLength = input.Value.Length,
                EncodedLength = encoded.Length
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                Message = $"Error encoding: {ex.Message}"
            });
        }
    }

    private async Task HandleDecode(HttpContext context)
    {
        var input = await context.Request.ReadFromJsonAsync<Base64Request>();

        if (input is null || string.IsNullOrWhiteSpace(input.Value))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = "Input value is required"
            });
            return;
        }

        try
        {
            var bytes = Convert.FromBase64String(input.Value);
            var decoded = Encoding.UTF8.GetString(bytes);

            await context.Response.WriteAsJsonAsync(new
            {
                Success = true,
                Original = input.Value,
                Decoded = decoded,
                OriginalLength = input.Value.Length,
                DecodedLength = decoded.Length
            });
        }
        catch (FormatException)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                Message = "Invalid Base64 string"
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                Success = false,
                Message = $"Error decoding: {ex.Message}"
            });
        }
    }
}

/// <summary>Request model for encode/decode endpoints.</summary>
public record Base64Request(string Value);
