using System;

namespace BikeSense.Api.Core.Entities
{
    public class FraudReport
    {
        public int Id { get; set; }
        public int BikeId { get; set; }
        public int? ReporterId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Bike? Bike { get; set; }
        public User? Reporter { get; set; }
    }
}
