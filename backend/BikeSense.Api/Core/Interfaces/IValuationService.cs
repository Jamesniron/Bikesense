using System.Threading.Tasks;
using BikeSense.Api.Core.DTOs;

namespace BikeSense.Api.Core.Interfaces
{
    public interface IValuationService
    {
        Task<ValuationResultDto> ValuationDiagnosticAsync(ValuationRequestDto request, decimal? listPrice);
    }
}
