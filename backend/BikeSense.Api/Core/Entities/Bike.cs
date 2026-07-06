using System;
using System.Collections.Generic;

namespace BikeSense.Api.Core.Entities
{
    public class Bike
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string BikeType { get; set; } = "Motorbikes"; // Scooters, Motorbikes, E-bikes, etc.
        public int Year { get; set; }
        public int Mileage { get; set; }
        public int EngineCC { get; set; }
        public string FuelType { get; set; } = "Petrol";
        public string Transmission { get; set; } = "Manual";
        public string Color { get; set; } = "Black";
        public decimal Price { get; set; }
        
        // Condition can be Excellent, Good, Fair, Poor
        public string Condition { get; set; } = "Good";
        public int OwnerCount { get; set; } = 1;
        
        // Verification specs
        public string Insurance { get; set; } = "Third Party";
        public string Registration { get; set; } = "Registered";
        public string ServiceHistory { get; set; } = "None"; // Full, Partial, None
        public string AccidentHistory { get; set; } = "None"; // None, Minor, Major
        
        public string? Description { get; set; }
        public string Location { get; set; } = "Colombo";
        public int SellerId { get; set; }
        public bool IsSuspicious { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User? Seller { get; set; }
        public ICollection<BikeImage> BikeImages { get; set; } = new List<BikeImage>();
        public ICollection<FraudReport> FraudReports { get; set; } = new List<FraudReport>();
    }
}
