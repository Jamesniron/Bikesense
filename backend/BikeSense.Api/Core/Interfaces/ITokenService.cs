using BikeSense.Api.Core.Entities;

namespace BikeSense.Api.Core.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
