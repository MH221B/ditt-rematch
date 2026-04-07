using DITT.Core.Enums;
using DITT.Core.Models;
using DITT.Host.Data;
using DITT.Host.Services.Interfaces;
using DITT.SDK;
using Microsoft.EntityFrameworkCore;

namespace DITT.Host.Services
{
    public class ToolRegistrationService : IToolRegistrationService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<ToolRegistrationService> _logger;

        public ToolRegistrationService(AppDbContext db, ILogger<ToolRegistrationService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task RegisterAsync(IToolPlugin plugin, bool isBuiltIn, string? frontendBundlePath = null, Guid? packageId = null)
        {
            var existing = await _db.Tools.FirstOrDefaultAsync(t => t.Name == plugin.Name);
            if (existing != null)
            {
                existing.Version = plugin.Version;
                existing.Description = plugin.Description;
                existing.Status = ToolStatus.Active;
                existing.IsBuiltIn = isBuiltIn;
                existing.IsPremium = plugin.IsPremium;
                existing.FrontendBundlePath = frontendBundlePath;
                existing.PackageId = packageId;

                _logger.LogInformation("Updated existing tool registration: {Name} v{Version}", plugin.Name, plugin.Version);
            }
            else
            {
                await _db.Tools.AddAsync(new Tool
                {
                    Id = Guid.NewGuid(),
                    Name = plugin.Name,
                    Version = plugin.Version, 
                    Description = plugin.Description,
                    Status = ToolStatus.Active,
                    IsBuiltIn = isBuiltIn,
                    IsPremium = plugin.IsPremium,
                    FrontendBundlePath = frontendBundlePath,
                    PackageId = packageId
                });

                _logger.LogInformation("Registered new tool: {Name} v{Version}", plugin.Name, plugin.Version);
            }

            await _db.SaveChangesAsync();
        }

        public async Task UnregisterAsync(string name)
        {
            var tool = await _db.Tools.FirstOrDefaultAsync(t => t.Name == name);
            if (tool != null)
            {
                tool.Status = ToolStatus.Inactive;
                await _db.SaveChangesAsync();
                _logger.LogInformation("Unregistered tool: {Name}", name);
            }
            else
            {
                _logger.LogWarning("Attempted to unregister non-existent tool: {Name}", name);
            }
        }

        public async Task<IEnumerable<Tool>> GetAllActiveAsync()
        {
            return await _db.Tools.Where(t => t.Status == ToolStatus.Active).OrderBy(t => t.Name).ToListAsync();
        }

        public async Task<IEnumerable<Tool>> GetAllAsync()
        {
            return await _db.Tools.OrderBy(t => t.Name).ToListAsync();
        }

        public async Task<IEnumerable<Tool>> GetByStatusAsync(ToolStatus status)
        {
            return await _db.Tools.Where(t => t.Status == status).OrderBy(t => t.Name).ToListAsync();
        }

        public async Task<Tool?> UpdateToolStatusAsync(string name, ToolStatus newStatus)
        {
            var tool = await _db.Tools.FirstOrDefaultAsync(t => t.Name == name);
            if (tool == null)
            {
                _logger.LogWarning("Attempted to update status of non-existent tool: {Name}", name);
                return null;
            }

            var oldStatus = tool.Status;
            tool.Status = newStatus;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Updated tool status: {Name} from {OldStatus} to {NewStatus}", name, oldStatus, newStatus);
            return tool;
        }

        public async Task<Tool?> UpdatePremiumAsync(string name, bool isPremium)
        {
            var tool = await _db.Tools.FirstOrDefaultAsync(t => t.Name == name);
            if (tool == null)
            {
                _logger.LogWarning("Attempted to update premium status of non-existent tool: {Name}", name);
                return null;
            }

            var oldValue = tool.IsPremium;
            tool.IsPremium = isPremium;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Updated tool premium status: {Name} from {OldValue} to {NewValue}", name, oldValue, isPremium);
            return tool;
        }
    }
}