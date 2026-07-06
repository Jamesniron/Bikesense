using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;
using BikeSense.Api.Core.Entities;
using BikeSense.Api.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BikeSense.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BikesController : ControllerBase
    {
        private readonly IBikeRepository _bikeRepository;
        private readonly IUserRepository _userRepository;
        private readonly IValuationService _valuationService;

        public BikesController(IBikeRepository bikeRepository, IUserRepository userRepository, IValuationService valuationService)
        {
            _bikeRepository = bikeRepository;
            _userRepository = userRepository;
            _valuationService = valuationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BikeDto>>> GetBikes(
            [FromQuery] string? brand,
            [FromQuery] string? type,
            [FromQuery] decimal? maxPrice,
            [FromQuery] bool onlyVerified = false)
        {
            var bikes = await _bikeRepository.GetBikesAsync(brand, type, maxPrice, onlyVerified);

            var bikeDtos = bikes.Select(b => new BikeDto
            {
                Id = b.Id,
                Title = b.Title,
                Brand = b.Brand,
                Model = b.Model,
                BikeType = b.BikeType,
                Year = b.Year,
                Mileage = b.Mileage,
                EngineCC = b.EngineCC,
                FuelType = b.FuelType,
                Transmission = b.Transmission,
                Color = b.Color,
                Price = b.Price,
                Condition = b.Condition,
                OwnerCount = b.OwnerCount,
                Insurance = b.Insurance,
                Registration = b.Registration,
                ServiceHistory = b.ServiceHistory,
                AccidentHistory = b.AccidentHistory,
                Description = b.Description,
                Location = b.Location,
                SellerId = b.SellerId,
                SellerName = b.Seller?.FullName ?? "Unknown Seller",
                SellerPhone = b.Seller?.PhoneNumber ?? "None Provided",
                IsSuspicious = b.IsSuspicious,
                CreatedDate = b.CreatedDate,
                ImageUrls = b.BikeImages.Select(img => img.ImageUrl).ToList()
            });

            return Ok(bikeDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BikeDto>> GetBike(int id)
        {
            var bike = await _bikeRepository.GetBikeByIdAsync(id);
            if (bike == null)
            {
                return NotFound("listing not found.");
            }

            var dto = new BikeDto
            {
                Id = bike.Id,
                Title = bike.Title,
                Brand = bike.Brand,
                Model = bike.Model,
                BikeType = bike.BikeType,
                Year = bike.Year,
                Mileage = bike.Mileage,
                EngineCC = bike.EngineCC,
                FuelType = bike.FuelType,
                Transmission = bike.Transmission,
                Color = bike.Color,
                Price = bike.Price,
                Condition = bike.Condition,
                OwnerCount = bike.OwnerCount,
                Insurance = bike.Insurance,
                Registration = bike.Registration,
                ServiceHistory = bike.ServiceHistory,
                AccidentHistory = bike.AccidentHistory,
                Description = bike.Description,
                Location = bike.Location,
                SellerId = bike.SellerId,
                SellerName = bike.Seller?.FullName ?? "Unknown Seller",
                SellerPhone = bike.Seller?.PhoneNumber ?? "None Provided",
                IsSuspicious = bike.IsSuspicious,
                CreatedDate = bike.CreatedDate,
                ImageUrls = bike.BikeImages.Select(img => img.ImageUrl).ToList()
            };

            return Ok(dto);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BikeDto>> CreateBike(BikeCreateDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized("User profile not found.");
            }

            // Simple baseline fraud rules scanner:
            bool isSuspicious = (dto.Mileage < 500 && (DateTime.UtcNow.Year - dto.Year) > 5) || dto.Price < 50000;

            // AI Fraud Detection Integration
            try {
                var valuationReq = new ValuationRequestDto {
                    Brand = dto.Brand,
                    Model = dto.Model,
                    Year = dto.Year,
                    Mileage = dto.Mileage,
                    EngineCC = dto.EngineCC,
                    Condition = dto.Condition,
                    OwnerCount = dto.OwnerCount,
                    ServiceHistory = dto.ServiceHistory,
                    AccidentHistory = dto.AccidentHistory
                };
                var aiValuation = await _valuationService.ValuationDiagnosticAsync(valuationReq, dto.Price);
                
                // If listed price is suspiciously low compared to AI bargain price (e.g. >30% cheaper)
                if (aiValuation != null && dto.Price < (aiValuation.SuggestedBargainPrice * 0.70m))
                {
                    isSuspicious = true;
                }
            } catch (Exception) {
                // Ignore AI failure and rely on baseline
            }

            var bike = new Bike
            {
                Title = dto.Title,
                Brand = dto.Brand,
                Model = dto.Model,
                BikeType = dto.BikeType,
                Year = dto.Year,
                Mileage = dto.Mileage,
                EngineCC = dto.EngineCC,
                FuelType = dto.FuelType,
                Transmission = dto.Transmission,
                Color = dto.Color,
                Price = dto.Price,
                Condition = dto.Condition,
                OwnerCount = dto.OwnerCount,
                Insurance = dto.Insurance,
                Registration = dto.Registration,
                ServiceHistory = dto.ServiceHistory,
                AccidentHistory = dto.AccidentHistory,
                Description = dto.Description,
                Location = dto.Location,
                SellerId = userId,
                IsSuspicious = isSuspicious
            };

            if (dto.ImageUrls != null)
            {
                bool isFirst = true;
                foreach (var url in dto.ImageUrls)
                {
                    bike.BikeImages.Add(new BikeImage
                    {
                        ImageUrl = url,
                        IsPrimary = isFirst
                    });
                    isFirst = false;
                }
            }
            else
            {
                // Fallback image url
                bike.BikeImages.Add(new BikeImage
                {
                    ImageUrl = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
                    IsPrimary = true
                });
            }

            await _bikeRepository.AddBikeAsync(bike);
            var result = await _bikeRepository.SaveAsync();

            if (!result)
            {
                return BadRequest("Failed to save listing changes.");
            }

            // Create response DTO
            var outDto = new BikeDto
            {
                Id = bike.Id,
                Title = bike.Title,
                Brand = bike.Brand,
                Model = bike.Model,
                BikeType = bike.BikeType,
                Year = bike.Year,
                Mileage = bike.Mileage,
                EngineCC = bike.EngineCC,
                FuelType = bike.FuelType,
                Transmission = bike.Transmission,
                Color = bike.Color,
                Price = bike.Price,
                Condition = bike.Condition,
                OwnerCount = bike.OwnerCount,
                Insurance = bike.Insurance,
                Registration = bike.Registration,
                ServiceHistory = bike.ServiceHistory,
                AccidentHistory = bike.AccidentHistory,
                Description = bike.Description,
                Location = bike.Location,
                SellerId = bike.SellerId,
                SellerName = user.FullName,
                SellerPhone = user.PhoneNumber ?? "None Provided",
                IsSuspicious = bike.IsSuspicious,
                CreatedDate = bike.CreatedDate,
                ImageUrls = bike.BikeImages.Select(img => img.ImageUrl).ToList()
            };

            // Increment Dealer active metrics if applicable
            if (user.DealerMetric != null)
            {
                // Simple mock bump or tracker integration
            }

            return CreatedAtAction(nameof(GetBike), new { id = bike.Id }, outDto);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBike(int id)
        {
            var bike = await _bikeRepository.GetBikeByIdAsync(id);
            if (bike == null)
            {
                return NotFound();
            }

            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            bool isAdmin = user?.Roles.Any(r => r.Name.Equals("Administrator", StringComparison.OrdinalIgnoreCase)) ?? false;

            // Restrict deletion to Administrator or listing Owner
            if (bike.SellerId != userId && !isAdmin)
            {
                return Forbid("You do not have authorization to delete this listing.");
            }

            await _bikeRepository.DeleteBikeAsync(id);
            await _bikeRepository.SaveAsync();

            return NoContent();
        }
    }
}
