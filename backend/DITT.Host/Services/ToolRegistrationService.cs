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

        public async Task RegisterAsync(IToolPlugin plugin, bool isBuiltIn)
        {
            var existing = await _db.Tools.FirstOrDefaultAsync(t => t.Name == plugin.Name);
            if (existing != null)
            {
                existing.Version = plugin.Version;
                existing.Description = plugin.Description;
                existing.Status = ToolStatus.Active;
                existing.IsBuiltIn = isBuiltIn;
                existing.IsPremium = plugin.IsPremium;

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
                    IsPremium = plugin.IsPremium
                });

                _logger.LogInformation("Registered new tool: {Name} v{Version}", plugin.Name, plugin.Version);
            }

            await _db.SaveChangesAsync();
        }
    }
}