using System.Threading.Tasks;
using BikeSense.Api.Core.Entities;

namespace BikeSense.Api.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByEmailAsync(string email);
        Task AddUserAsync(User user);
        Task<Role?> GetRoleByNameAsync(string roleName);
        Task<bool> SaveAsync();
    }
}
