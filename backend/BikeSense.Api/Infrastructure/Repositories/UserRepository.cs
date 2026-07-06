using System.Threading.Tasks;
using BikeSense.Api.Core.Entities;
using BikeSense.Api.Core.Interfaces;
using BikeSense.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeSense.Api.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly BikeSenseDbContext _context;

        public UserRepository(BikeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.DealerMetric)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.DealerMetric)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
