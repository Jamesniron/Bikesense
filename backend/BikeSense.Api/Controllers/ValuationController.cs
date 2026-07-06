using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;
using BikeSense.Api.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BikeSense.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ValuationController : ControllerBase
    {
        private readonly IValuationService _valuationService;

        public ValuationController(IValuationService valuationService)
        {
            _valuationService = valuationService;
        }

        [HttpPost("valuate")]
        public async Task<ActionResult<ValuationResultDto>> Valuate(
            [FromBody] ValuationRequestDto request,
            [FromQuery] decimal? listPrice = null)
        {
            var result = await _valuationService.ValuationDiagnosticAsync(request, listPrice);
            return Ok(result);
        }
    }
}
