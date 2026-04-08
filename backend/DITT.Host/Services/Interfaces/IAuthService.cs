using DITT.Core.Models;

namespace DITT.Host.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(AuthRequest request);
    // Task<AuthResponse> LoginAsync(AuthRequest request);
    // Task<UserDTO?> GetUserByIdAsync(string userId);
}