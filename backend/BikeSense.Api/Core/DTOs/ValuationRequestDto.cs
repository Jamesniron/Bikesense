using System.ComponentModel.DataAnnotations;

namespace BikeSense.Api.Core.DTOs
{
    public class ValuationRequestDto
    {
        [Required]
        public string Brand { get; set; } = string.Empty;

        [Required]
        public string Model { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required]
        public int EngineCC { get; set; }

        public string Condition { get; set; } = "Good"; // Excellent, Good, Fair, Poor
        public int OwnerCount { get; set; } = 1;
        public string ServiceHistory { get; set; } = "None"; // Full, Partial, None
        public string AccidentHistory { get; set; } = "None"; // None, Minor, Major
    }
}
