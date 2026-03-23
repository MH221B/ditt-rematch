using DITT.Core.Enums;
using DITT.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DITT.Host.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
    
    public DbSet<Tool> Tools => Set<Tool>();
    
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
    }
}
