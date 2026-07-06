using System;
using System.Collections.Generic;

namespace BikeSense.Api.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsGoogleUser { get; set; }
        public bool IsVerified { get; set; }
        public string? VerificationToken { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<Role> Roles { get; set; } = new List<Role>();
        public ICollection<Bike> Bikes { get; set; } = new List<Bike>();
        public DealerMetric? DealerMetric { get; set; }
    }
}
