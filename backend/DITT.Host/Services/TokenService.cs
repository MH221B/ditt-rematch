using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

using DITT.Host.Services.Interfaces;

namespace DITT.Host.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(IdentityUser user, List<string> roles)
    {
        // 1. Ask IConfiguration for the exact flat names from your .env file
        var keyString = _config["JWT_KEY"] 
            ?? throw new InvalidOperationException("JWT_KEY not configured");
            
        var issuer = _config["JWT_ISSUER"] 
            ?? throw new InvalidOperationException("JWT_ISSUER not configured");
            
        var audience = _config["JWT_AUDIENCE"] 
            ?? throw new InvalidOperationException("JWT_AUDIENCE not configured");
            
        var expirationMinutes = int.Parse(_config["JWT_EXPIRATION_MINUTES"] ?? "1440");

        // 2. Setup Security Key and Signing Credentials
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 3. Map IdentityUser to claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Email ?? String.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? String.Empty)
        };

        // 4. Add role claims
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        // 5. Create the token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}