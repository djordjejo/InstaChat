using Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext context,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var (status, title) = exception switch
            {
                NotFoundException => (StatusCodes.Status404NotFound, "Nije pronađeno"),
                ForbiddenException => (StatusCodes.Status403Forbidden, "Pristup odbijen"),
                ConflictException => (StatusCodes.Status409Conflict, "Konflikt"),
                InvalidCredentialsException => (StatusCodes.Status401Unauthorized, "Neuspešna prijava"),
                _ => (StatusCodes.Status500InternalServerError, "Greška servera")
            };

            if (status == StatusCodes.Status500InternalServerError)
                _logger.LogError(exception, "Neočekivana greška na {Path}", context.Request.Path);
            else
                _logger.LogWarning("{Exception}: {Message}", exception.GetType().Name, exception.Message);

            var problem = new ProblemDetails
            {
                Status = status,
                Title = title,
                // Kod 500 NE saljemo exception.Message - tu curi ime tabele,
                // konekcioni string, putanja na disku... Klijent dobija samo generiku.
                Detail = status == StatusCodes.Status500InternalServerError
                    ? "Došlo je do neočekivane greške."
                    : exception.Message,
                Instance = context.Request.Path
            };

            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(problem, cancellationToken);

            return true;   // "obradio sam ovo, ne prosleđuj dalje"
        }
    }
}