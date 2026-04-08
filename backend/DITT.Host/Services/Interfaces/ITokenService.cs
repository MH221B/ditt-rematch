using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace DITT.Host.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(IdentityUser user, List<string> roles);
}
