using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;
using BikeSense.Api.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace BikeSense.Api.Core.Services
{
    public class ValuationService : IValuationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ValuationService> _logger;

        public ValuationService(HttpClient httpClient, ILogger<ValuationService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpClient.Timeout = TimeSpan.FromSeconds(3); // Fast timeout for quick fallback
        }

        public async Task<ValuationResultDto> ValuationDiagnosticAsync(ValuationRequestDto request, decimal? listPrice)
        {
            decimal predictedPrice = 0;
            bool fetchSuccess = false;

            // 1. Attempt to hit Python ML REST API
            try
            {
                var response = await _httpClient.PostAsJsonAsync("http://localhost:8000/predict?list_price=" + listPrice, request);
                if (response.IsSuccessStatusCode)
                {
                    var resultStr = await response.Content.ReadAsStringAsync();
                    try {
                        var mlResult = JsonSerializer.Deserialize<ValuationResultDto>(resultStr, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (mlResult != null && mlResult.PredictedPrice > 0) {
                            return mlResult;
                        }
                    } catch (Exception) {
                        // Fallback to manual parsing if schema differs slightly
                        using var doc = JsonDocument.Parse(resultStr);
                        if (doc.RootElement.TryGetProperty("predicted_price", out var priceToken))
                        {
                            predictedPrice = priceToken.GetDecimal();
                            fetchSuccess = true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Unable to query Python FastAPI ML Service: {ex.Message}. Falling back to internal engine.");
            }

            // 2. Fallback: Calibrated Regression Model
            if (!fetchSuccess)
            {
                predictedPrice = CalculateFallbackPrice(request);
            }

            // 3. Calculate Health Score (0-100)
            int healthScore = CalculateHealthScore(request);

            // 4. Calculate Deal Rating comparing list price
            string dealRating = "Fair Price";
            if (listPrice.HasValue && listPrice.Value > 0)
            {
                decimal diff = listPrice.Value - predictedPrice;
                decimal threshold = predictedPrice * 0.08m; // 8% window

                if (diff < -threshold)
                    dealRating = "Excellent Deal";
                else if (diff > threshold)
                    dealRating = "Overpriced";
                else
                    dealRating = "Fair Price";
            }

            // 5. Generate 3-Year Resale Depreciation Curve
            var curve = new List<YearlyDepreciationDto>();
            decimal currentVal = predictedPrice;
            decimal baseDepreciationRate = 0.12m; // 12% standard annual drop

            if (request.Condition.Equals("Excellent", StringComparison.OrdinalIgnoreCase))
                baseDepreciationRate = 0.09m;
            else if (request.Condition.Equals("Fair", StringComparison.OrdinalIgnoreCase))
                baseDepreciationRate = 0.16m;
            else if (request.Condition.Equals("Poor", StringComparison.OrdinalIgnoreCase))
                baseDepreciationRate = 0.22m;

            for (int i = 1; i <= 3; i++)
            {
                currentVal = currentVal * (1 - baseDepreciationRate);
                curve.Add(new YearlyDepreciationDto
                {
                    YearsPassed = i,
                    ProjectedValue = Math.Round(currentVal, 0)
                });
            }

            // 6. Suggest negotiable bargain price (target buying point)
            decimal bargainPrice = predictedPrice * 0.92m; // suggest starting 8% lower for buyers

            // 7. Calculate Ownership Cost Calculator (LKR)
            // Estimated annual maintenance
            decimal annualMaint = 12000m;
            if (request.EngineCC > 200) annualMaint = 28000m;
            else if (request.EngineCC > 150) annualMaint = 18000m;

            if (request.Age() > 8) annualMaint += 8000m; // older bikes cost more

            // Estimated annual insurance
            decimal annualIns = 6500m; // base third-party
            if (request.EngineCC > 150) annualIns = 14500m;

            // Annual fuel economy estimations
            decimal annualFuel = EstimateFuelCost(request);

            // Annual state license tax fee
            decimal annualLicense = 2500m;
            if (request.EngineCC > 150) annualLicense = 4000m;

            return new ValuationResultDto
            {
                PredictedPrice = Math.Round(predictedPrice, 0),
                HealthScore = healthScore,
                DealRating = dealRating,
                DepreciationCurve = curve,
                SuggestedBargainPrice = Math.Round(bargainPrice, 0),
                AnnualFuelCost = annualFuel,
                AnnualMaintenanceCost = annualMaint,
                AnnualInsuranceCost = annualIns,
                AnnualLicenseCost = annualLicense
            };
        }

        private decimal CalculateFallbackPrice(ValuationRequestDto req)
        {
            // Coefficients calibrated with Sri Lankan used marketplace data (used-bikes.csv)
            decimal basePrice = 280000m; // standard intercept

            // CC adjustment
            basePrice += (req.EngineCC - 100) * 1600m;

            // Brand adjustments
            string brand = req.Brand.ToLower();
            if (brand == "honda") basePrice += 45000m;
            else if (brand == "yamaha") basePrice += 55000m;
            else if (brand == "suzuki") basePrice += 30000m;
            else if (brand == "vespa") basePrice += 80000m;
            else if (brand == "ktm") basePrice += 120000m;
            else if (brand == "bajaj") basePrice -= 25000m;
            else if (brand == "tvs") basePrice -= 20000m;
            else if (brand == "hero") basePrice -= 35000m;

            // Year (Age depreciation)
            int age = req.Age();
            decimal deprecFactor = 1.0m - (age * 0.065m); // 6.5% compound drop
            if (deprecFactor < 0.25m) deprecFactor = 0.25m; // cap minimum value at 25% of brand new

            basePrice = basePrice * deprecFactor;

            // Mileage factor
            decimal mileageFactor = req.Mileage * 1.50m; // -1.50 LKR per km driven
            basePrice -= mileageFactor;

            // Condition factor
            string cond = req.Condition.ToLower();
            if (cond == "excellent") basePrice *= 1.12m; // newer condition premium
            else if (cond == "fair") basePrice *= 0.85m;
            else if (cond == "poor") basePrice *= 0.65m;

            // Service history
            string serv = req.ServiceHistory.ToLower();
            if (serv == "full") basePrice *= 1.05m;
            else if (serv == "none") basePrice *= 0.95m;

            // Accident history
            string acc = req.AccidentHistory.ToLower();
            if (acc == "minor") basePrice *= 0.85m;
            else if (acc == "major") basePrice *= 0.60m;

            // Owners factor
            if (req.OwnerCount > 2) basePrice *= 0.92m;

            // Enforce realistic bounds
            if (basePrice < 35000m) basePrice = 35000m;

            return basePrice;
        }

        private int CalculateHealthScore(ValuationRequestDto req)
        {
            int score = 100;

            // Deduct based on mileage
            int mileageDeduction = req.Mileage / 5000; // -1 point per 5k kms
            score -= mileageDeduction;

            // Deduct based on age
            int ageDeduction = req.Age() * 3; // -3 points per year
            score -= ageDeduction;

            // Deduct based on condition
            string cond = req.Condition.ToLower();
            if (cond == "good") score -= 5;
            else if (cond == "fair") score -= 20;
            else if (cond == "poor") score -= 40;

            // Deduct for accidents
            string acc = req.AccidentHistory.ToLower();
            if (acc == "minor") score -= 15;
            else if (acc == "major") score -= 40;

            // Service history adjustment
            string serv = req.ServiceHistory.ToLower();
            if (serv == "full") score += 5; // bonus points
            else if (serv == "none") score -= 10;

            // Keep in bounds
            if (score > 100) score = 100;
            if (score < 15) score = 15; // mechanical scrap limit

            return score;
        }

        private decimal EstimateFuelCost(ValuationRequestDto req)
        {
            // Fuel Efficiency Estimation (km/liter)
            double kmPerLiter = 45.0; // base mileage
            if (req.EngineCC < 110) kmPerLiter = 60.0;
            else if (req.EngineCC < 130) kmPerLiter = 52.0;
            else if (req.EngineCC > 200) kmPerLiter = 30.0;
            else if (req.EngineCC > 160) kmPerLiter = 38.0;

            double avgKmsYear = 12000.0; // average yearly riding
            double litersPerYear = avgKmsYear / kmPerLiter;

            decimal fuelPriceLKR = 370.00m; // modern fuel cost in Sri Lanka (Octane 92 LKR/liter)
            return Math.Round((decimal)litersPerYear * fuelPriceLKR, 0);
        }
    }

    public static class ValuationRequestExtensions
    {
        public static int Age(this ValuationRequestDto req)
        {
            int currentYear = DateTime.UtcNow.Year;
            int age = currentYear - req.Year;
            if (age < 0) age = 0;
            return age;
        }
    }
}
