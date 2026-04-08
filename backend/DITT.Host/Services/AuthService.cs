using DITT.Core.Models;
using DITT.Host.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace DITT.Host.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ITokenService tokenService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(AuthRequest request)
    {
        var userExists = await _userManager.FindByEmailAsync(request.Email);
        if (userExists != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "User already exists!" 
            };
        }

        var user = new IdentityUser
        {
            Email = request.Email,
            UserName = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return new AuthResponse
            {
                Success = false,
                Message = string.Join(", ", result.Errors.Select(e => e.Description))
            };
        }

        await _userManager.AddToRoleAsync(user, "User");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles.ToList());

        _logger.LogInformation("User registered: {Email}", request.Email);

        return new AuthResponse
        {
            Success = true,
            Message = "User registered successfully",
            Token = token,
            ExpiresIn = 1440, // 24 hours in minutes
            User = new UserDTO
            {
                UserId = user.Id,
                Email = user.Email,
                Roles = roles.ToList()
            }
        };
    }

}