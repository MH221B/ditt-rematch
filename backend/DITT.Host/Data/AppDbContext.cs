using DITT.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace DITT.Host.Data;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
    
    public DbSet<Tool> Tools => Set<Tool>();
    public DbSet<PluginPackage> PluginPackages => Set<PluginPackage>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tool>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.IsBuiltIn).IsRequired();
            entity.Property(e => e.IsPremium).IsRequired();
            entity.Property(e => e.Status)
                  .IsRequired()
                  .HasConversion<string>() // Stores enum as string in DB
                  .HasMaxLength(50);
            entity.HasIndex(e => e.Name).IsUnique(); // No duplicate tool names
        });

        // PluginPackage configuration
        modelBuilder.Entity<PluginPackage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Version).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Author).HasMaxLength(100);
            entity.Property(e => e.DllHash).IsRequired().HasMaxLength(64); // SHA256 hex
            entity.Property(e => e.PackagePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FrontendBundlePath).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasConversion<string>();
            entity.Property(e => e.UploadedAt).IsRequired();
            
            // Relationship to Tool
            entity.HasOne(e => e.Tool)
                  .WithMany()
                  .HasForeignKey(e => e.ToolId)
                  .OnDelete(DeleteBehavior.SetNull);
            
            // Unique constraint on name+version
            entity.HasIndex(e => new { e.Name, e.Version }).IsUnique();
        });
    }
}
