using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        Version = "1.0.0"
    });
}