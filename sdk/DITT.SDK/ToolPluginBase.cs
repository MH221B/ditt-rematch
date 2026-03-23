using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace DITT.SDK
{
    public abstract class ToolPluginBase : IToolPlugin
    {
        public abstract string Name { get; }
        public abstract string Version { get; }
        public abstract string Description { get; }
        public virtual bool IsBuiltIn => false;
        public virtual bool IsPremium => false;
        
        public virtual void ConfigureServices(IServiceCollection services) {}
        public virtual void ConfigureEndpoints(IEndpointRouteBuilder endpoints) {}
        
    }
}