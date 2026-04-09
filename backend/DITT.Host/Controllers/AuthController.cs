using DITT.Core.Models;
using DITT.Host.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest request)
    {
        var response = await _authService.RegisterAsync(request);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { token = response.Token, user = response.User, expiresIn = response.ExpiresIn });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { token = response.Token, user = response.User, expiresIn = response.ExpiresIn });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User ID not found in claims" });
        }

        var response = await _authService.LogoutAsync(userId);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { message = response.Message });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        _logger.LogInformation("GetProfile called");
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("GetProfile: Extracted User ID from claims: {UserId}", userId);
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("GetProfile: User ID not found in claims");
            return Unauthorized(new { message = "User ID not found in claims" });
        }

        _logger.LogInformation("GetProfile: Retrieving user with ID: {UserId}", userId);
        var user = await _authService.GetUserByIdAsync(userId);
        _logger.LogInformation("GetProfile: Successfully retrieved user profile for ID: {UserId}", userId);
        return Ok(user);
    }

    [Authorize]
    [HttpPost("upgrade-premium")]
    public async Task<IActionResult> UpgradeToPremium()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User ID not found in claims" });
        }

        var response = await _authService.UpgradeToPremiumAsync(userId);
        if (!response.Success)
            return BadRequest(new { message = response.Message });

        return Ok(new { message = response.Message, user = response.User });
    }
}