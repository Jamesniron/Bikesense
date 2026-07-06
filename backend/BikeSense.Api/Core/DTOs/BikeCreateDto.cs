using System.ComponentModel.DataAnnotations;

namespace BikeSense.Api.Core.DTOs
{
    public class BikeCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Brand { get; set; } = string.Empty;

        [Required]
        public string Model { get; set; } = string.Empty;

        [Required]
        public string BikeType { get; set; } = "Motorbikes";

        [Required]
        public int Year { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required]
        public int EngineCC { get; set; }

        public string FuelType { get; set; } = "Petrol";
        public string Transmission { get; set; } = "Manual";
        public string Color { get; set; } = "Black";

        [Required]
        public decimal Price { get; set; }

        public string Condition { get; set; } = "Good";
        public int OwnerCount { get; set; } = 1;

        public string Insurance { get; set; } = "Third Party";
        public string Registration { get; set; } = "Registered";
        public string ServiceHistory { get; set; } = "None";
        public string AccidentHistory { get; set; } = "None";

        public string? Description { get; set; }

        [Required]
        public string Location { get; set; } = "Colombo";

        public string[]? ImageUrls { get; set; }
    }
}
