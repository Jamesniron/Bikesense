namespace BikeSense.Api.Core.Entities
{
    public class BikeImage
    {
        public int Id { get; set; }
        public int BikeId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = false;

        // Navigation Properties
        public Bike? Bike { get; set; }
    }
}
