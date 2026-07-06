using System.Collections.Generic;

namespace BikeSense.Api.Core.DTOs
{
    public class ValuationResultDto
    {
        public decimal PredictedPrice { get; set; }
        public int HealthScore { get; set; }
        public string DealRating { get; set; } = "Fair Price"; // Excellent Deal, Fair Price, Overpriced
        public List<YearlyDepreciationDto> DepreciationCurve { get; set; } = new List<YearlyDepreciationDto>();
        public decimal SuggestedBargainPrice { get; set; }
        
        // Target 3-Year Ownership Costs
        public decimal AnnualFuelCost { get; set; }
        public decimal AnnualMaintenanceCost { get; set; }
        public decimal AnnualInsuranceCost { get; set; }
        public decimal AnnualLicenseCost { get; set; }
    }

    public class YearlyDepreciationDto
    {
        public int YearsPassed { get; set; }
        public decimal ProjectedValue { get; set; }
    }
}
