using DITT.Core.Models;
using DITT.SDK;

namespace DITT.Host.Services.Interfaces
{
    public interface IToolRegistrationService
    {
        public Task RegisterAsync(IToolPlugin plugin, bool isBuiltIn);
        public Task UnregisterAsync(string name);
        public Task<IEnumerable<Tool>> GetAllActiveAsync();
    }
}