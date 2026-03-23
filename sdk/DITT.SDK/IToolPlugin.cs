using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace DITT.SDK
{
    public interface IToolPlugin
    {
        string Name { get; }
        string Version { get; }
        string Description { get; }
        bool IsBuiltIn { get; }
        bool IsPremium { get; }
        void ConfigureServices(IServiceCollection services);
        void ConfigureEndpoints(IEndpointRouteBuilder endpoints);
    }
}