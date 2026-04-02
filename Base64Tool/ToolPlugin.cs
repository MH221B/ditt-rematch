// templates/ditt-tool/ToolPlugin.cs
using System;
using Microsoft.AspNetCore.Http;
using DITT.SDK;

namespace Base64Tool;

/// <summary>
/// Entry point for the Base64Tool plugin.
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

            case "encode":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { success = false, error = "Method not allowed" });
                    break;
                }
                await HandleEncode(context);
                break;

            case "decode":
                if (!HttpMethods.IsPost(context.Request.Method))
                {
                    context.Response.StatusCode = 405;
                    await context.Response.WriteAsJsonAsync(new { success = false, error = "Method not allowed" });
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
                success = false,
                error = "Input value is required"
            });
            return;
        }

        try
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(input.Value);
            var encoded = Convert.ToBase64String(bytes);

            // Apply URL-safe conversion if requested
            if (input.UrlSafe)
            {
                encoded = encoded.Replace("+", "-").Replace("/", "_").TrimEnd('=');
            }

            await context.Response.WriteAsJsonAsync(new
            {
                success = true,
                data = encoded
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                error = $"Encoding error: {ex.Message}"
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
                success = false,
                error = "Input value is required"
            });
            return;
        }

        try
        {
            var base64String = input.Value;

            // Reverse URL-safe conversion if requested
            if (input.UrlSafe)
            {
                base64String = base64String.Replace("-", "+").Replace("_", "/");
                // Re-add padding if necessary
                var padding = (4 - (base64String.Length % 4)) % 4;
                base64String = base64String.PadRight(base64String.Length + padding, '=');
            }

            var bytes = Convert.FromBase64String(base64String);
            var decoded = System.Text.Encoding.UTF8.GetString(bytes);

            await context.Response.WriteAsJsonAsync(new
            {
                success = true,
                data = decoded
            });
        }
        catch (FormatException)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                error = "Invalid Base64 input"
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                error = $"Decoding error: {ex.Message}"
            });
        }
    }
}

/// <summary>Request model for encode/decode endpoints.</summary>
public record Base64Request(string Value, bool UrlSafe);
