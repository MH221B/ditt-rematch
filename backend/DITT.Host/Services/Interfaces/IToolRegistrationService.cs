using DITT.Core.Models;
using DITT.SDK;

using DITT.Core.Enums;

namespace DITT.Host.Services.Interfaces
{
    public interface IToolRegistrationService
    {
        public Task RegisterAsync(IToolPlugin plugin, bool isBuiltIn, string? frontendBundlePath = null, Guid? packageId = null);
        public Task UnregisterAsync(string name);
        public Task<bool> DeleteAsync(string name);
        public Task<IEnumerable<Tool>> GetAllActiveAsync();
        public Task<IEnumerable<Tool>> GetAllAsync();
        public Task<IEnumerable<Tool>> GetByStatusAsync(ToolStatus status);
        public Task<Tool?> UpdateToolStatusAsync(string name, ToolStatus newStatus);
        public Task<Tool?> UpdatePremiumAsync(string name, bool isPremium);
    }
}