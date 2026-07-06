using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace BikeSense.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public RecommendationsController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("MlServiceClient");
            _httpClient.BaseAddress = new Uri("http://localhost:8000/");
        }

        [HttpPost]
        public async Task<IActionResult> Recommend([FromBody] RecommendRequestDto request)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("recommend", request);
                if (response.IsSuccessStatusCode)
                {
                    var resultStr = await response.Content.ReadAsStringAsync();
                    return Content(resultStr, "application/json");
                }
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "ML Service Unavailable", details = ex.Message });
            }
        }
    }

    public class RecommendRequestDto
    {
        public decimal Budget { get; set; }
        public string UsageType { get; set; } = "commute";
        public string? PreferredBrand { get; set; }
        public string MileagePriority { get; set; } = "medium";
        public int? MaxCC { get; set; }
    }
}
