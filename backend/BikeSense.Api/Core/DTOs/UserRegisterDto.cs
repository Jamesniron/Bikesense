using System.ComponentModel.DataAnnotations;

namespace BikeSense.Api.Core.DTOs
{
    public class UserRegisterDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string Role { get; set; } = "Buyer"; // Buyer, Seller, Dealer
    }
}
