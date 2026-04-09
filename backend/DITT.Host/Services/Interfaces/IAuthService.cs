using DITT.Core.Models;

namespace DITT.Host.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(AuthRequest request);
    Task<AuthResponse> LoginAsync(AuthRequest request);
    Task<UserDTO?> GetUserByIdAsync(string userId);
    Task<AuthResponse> LogoutAsync(string userId);
    Task<AuthResponse> UpgradeToPremiumAsync(string userId);
    bool IsTokenExpired(string token);
}