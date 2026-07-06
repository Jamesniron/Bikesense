using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BikeSense.Api.Core.Entities;
using BikeSense.Api.Core.Interfaces;
using BikeSense.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BikeSense.Api.Infrastructure.Repositories
{
    public class BikeRepository : IBikeRepository
    {
        private readonly BikeSenseDbContext _context;

        public BikeRepository(BikeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Bike>> GetBikesAsync(string? brand, string? type, decimal? maxPrice, bool onlyVerified)
        {
            var query = _context.Bikes
                .Include(b => b.BikeImages)
                .Include(b => b.Seller)
                .AsQueryable();

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(b => b.Brand.ToLower() == brand.ToLower());
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(b => b.BikeType.ToLower() == type.ToLower());
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(b => b.Price <= maxPrice.Value);
            }

            if (onlyVerified)
            {
                query = query.Where(b => !b.IsSuspicious);
            }

            return await query.ToListAsync();
        }

        public async Task<Bike?> GetBikeByIdAsync(int id)
        {
            return await _context.Bikes
                .Include(b => b.BikeImages)
                .Include(b => b.Seller)
                .Include(b => b.FraudReports)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task AddBikeAsync(Bike bike)
        {
            await _context.Bikes.AddAsync(bike);
        }

        public async Task UpdateBikeAsync(Bike bike)
        {
            _context.Bikes.Update(bike);
            await Task.CompletedTask;
        }

        public async Task DeleteBikeAsync(int id)
        {
            var bike = await _context.Bikes.FindAsync(id);
            if (bike != null)
            {
                _context.Bikes.Remove(bike);
            }
        }

        public async Task<bool> SaveAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
