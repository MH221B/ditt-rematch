using DITT.Host.Services.Interfaces;
using DITT.PluginLoader;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers;

[ApiController]
[Route("api/tools")]
public class ToolsController : ControllerBase
{
    private readonly PluginManager _pluginManager;
    private readonly IToolRegistrationService _toolRegistrationService;
    private readonly ILogger<ToolsController> _logger;

    public ToolsController(PluginManager pluginManager, IToolRegistrationService toolRegistrationService, ILogger<ToolsController> logger)
    {
        _pluginManager = pluginManager;
        _toolRegistrationService = toolRegistrationService;
        _logger = logger;
    }

    [HttpGet("{pluginName}/{**path}")]
    [HttpPost("{pluginName}/{**path}")]
    [HttpPut("{pluginName}/{**path}")]
    [HttpDelete("{pluginName}/{**path}")]
    public async Task Invoke(string pluginName, string path)
    {
        // Check if tool exists in database
        var tool = await _toolRegistrationService.GetByNameAsync(pluginName);

        if (tool == null)
        {
            HttpContext.Response.StatusCode = 404;
            await HttpContext.Response.WriteAsJsonAsync(new
            {
                Message = $"Tool '{pluginName}' not found"
            });
            return;
        }

        // Check if tool is premium and user has access
        if (tool.IsPremium)
        {
            // Require authentication for premium tools
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                HttpContext.Response.StatusCode = 401;
                await HttpContext.Response.WriteAsJsonAsync(new
                {
                    Message = $"Authentication required to access premium tool '{pluginName}'"
                });
                return;
            }

            // Check if user has premium role
            if (!User.IsInRole("PremiumUser"))
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                _logger.LogWarning("Non-premium user {UserId} attempted to access premium tool: {ToolName}", userId, pluginName);
                HttpContext.Response.StatusCode = 403;
                await HttpContext.Response.WriteAsJsonAsync(new
                {
                    Message = $"Premium subscription required to access tool '{pluginName}'"
                });
                return;
            }
        }

        var plugin = _pluginManager.GetPluginInstance(pluginName);

        if (plugin == null)
        {
            HttpContext.Response.StatusCode = 404;
            await HttpContext.Response.WriteAsJsonAsync(new
            {
                Message = $"Plugin '{pluginName}' not found"
            });
            return;
        }

        var handler = plugin.CreateRequestHandler();
        await handler(HttpContext);
    }
}