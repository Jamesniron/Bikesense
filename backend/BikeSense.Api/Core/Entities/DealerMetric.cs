namespace BikeSense.Api.Core.Entities
{
    public class DealerMetric
    {
        public int Id { get; set; }
        public int DealerId { get; set; }
        public int ViewsCount { get; set; } = 0;
        public int SalesCount { get; set; } = 0;
        public decimal TotalRevenue { get; set; } = 0.00m;

        // Navigation Properties
        public User? Dealer { get; set; }
    }
}
