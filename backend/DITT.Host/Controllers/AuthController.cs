using DITT.Core.Models;
using DITT.Host.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { token = response.Token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { token = response.Token, user = response.User, expiresIn = response.ExpiresIn });
    }
}