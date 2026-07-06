using System.Collections.Generic;
using System.Threading.Tasks;
using BikeSense.Api.Core.Entities;

namespace BikeSense.Api.Core.Interfaces
{
    public interface IBikeRepository
    {
        Task<IEnumerable<Bike>> GetBikesAsync(string? brand, string? type, decimal? maxPrice, bool onlyVerified);
        Task<Bike?> GetBikeByIdAsync(int id);
        Task AddBikeAsync(Bike bike);
        Task UpdateBikeAsync(Bike bike);
        Task DeleteBikeAsync(int id);
        Task<bool> SaveAsync();
    }
}
