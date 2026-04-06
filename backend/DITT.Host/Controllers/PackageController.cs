using DITT.Host.Services;
using Microsoft.AspNetCore.Mvc;

namespace DITT.Host.Controllers;

[ApiController]
[Route("api/packages")]
public class PackageController : ControllerBase
{
    private readonly IPackageService _packageService;

    public PackageController(IPackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided."});

        var (success, error, package) = await _packageService.UploadPackageAsync(file);

        if (!success)
            return BadRequest(new { error });
        
        return Ok(new
        {
            message = "Package uploaded successfully",
            package = new
            {
                package!.Id,
                package.Name,
                package.Version,
                package.Author,
                package.Description,
                package.UploadedAt
            }
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _packageService.GetPackagesAsync();
        return Ok(packages.Select(p => new
        {
            p.Id,
            p.Name,
            p.Author,
            p.Description,
            p.Status,
            p.UploadedAt    
        }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _packageService.DeletePackageAsync(id);
        if (!success)
            return NotFound();
        return Ok(new { message = "Package deleted successfully" });
    }
}