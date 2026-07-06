using System;
using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;
using BikeSense.Api.Core.Entities;
using BikeSense.Api.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BikeSense.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(UserRegisterDto dto)
        {
            if (await _userRepository.GetUserByEmailAsync(dto.Email) != null)
            {
                return BadRequest("Email is already registered.");
            }

            var role = await _userRepository.GetRoleByNameAsync(dto.Role);
            if (role == null)
            {
                return BadRequest($"Specified role '{dto.Role}' is invalid.");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                IsVerified = true // Automate verification for prototype speed
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);
            user.Roles.Add(role);

            // If registering as a Dealer, seed empty dealer metrics
            if (dto.Role.Equals("Dealer", StringComparison.OrdinalIgnoreCase))
            {
                user.DealerMetric = new DealerMetric
                {
                    ViewsCount = 0,
                    SalesCount = 0,
                    TotalRevenue = 0.00m
                };
            }

            await _userRepository.AddUserAsync(user);
            await _userRepository.SaveAsync();

            var token = _tokenService.CreateToken(user);

            return CreatedAtAction(nameof(Login), new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = dto.Role
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(UserLoginDto dto)
        {
            var user = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return Unauthorized("Invalid email credentials.");
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid password credentials.");
            }

            var token = _tokenService.CreateToken(user);

            // Get primary role name
            var roleName = "Buyer";
            foreach (var r in user.Roles)
            {
                roleName = r.Name; // Use last found role
            }

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = roleName
            });
        }
    }
}
