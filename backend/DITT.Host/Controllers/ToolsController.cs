using DITT.PluginLoader;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers;

[ApiController]
[Route("api/tools")]
public class ToolsController : ControllerBase
{
    private readonly PluginManager _pluginManager;

    public ToolsController(PluginManager pluginManager)
    {
        _pluginManager = pluginManager;
    }

    [HttpGet("{pluginName}/{**path}")]
    [HttpPost("{pluginName}/{**path}")]
    [HttpPut("{pluginName}/{**path}")]
    [HttpDelete("{pluginName}/{**path}")]
    public async Task Invoke(string pluginName, string path)
    {
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