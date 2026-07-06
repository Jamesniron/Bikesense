using System;
using System.Collections.Generic;

namespace BikeSense.Api.Core.DTOs
{
    public class BikeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string BikeType { get; set; } = "Motorbikes";
        public int Year { get; set; }
        public int Mileage { get; set; }
        public int EngineCC { get; set; }
        public string FuelType { get; set; } = "Petrol";
        public string Transmission { get; set; } = "Manual";
        public string Color { get; set; } = "Black";
        public decimal Price { get; set; }
        public string Condition { get; set; } = "Good";
        public int OwnerCount { get; set; } = 1;
        public string Insurance { get; set; } = "Third Party";
        public string Registration { get; set; } = "Registered";
        public string ServiceHistory { get; set; } = "None";
        public string AccidentHistory { get; set; } = "None";
        public string? Description { get; set; }
        public string Location { get; set; } = "Colombo";
        public int SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;
        public bool IsSuspicious { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
    }
}
