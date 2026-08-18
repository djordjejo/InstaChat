using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Common.Behaviors
{
    /// <summary>
    /// MediatR pipeline behavior: presrece SVAKI request pre nego sto stigne do
    /// handlera i pusta ga dalje samo ako prodje validaciju.
    ///
    /// Zasto ovako, a ne provera u svakom handleru: handler tada radi samo svoj
    /// posao i sme da pretpostavi da su podaci ispravni. Novi handler dobija
    /// validaciju automatski, cim mu se napise validator - nema sanse da se
    /// zaboravi.
    /// </summary>
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Za requestove bez validatora ne radimo nista - nije greska,
            // prosto nemaju pravila.
            if (!_validators.Any())
                return await next(cancellationToken);

            var context = new ValidationContext<TRequest>(request);

            var results = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures = results
                .SelectMany(r => r.Errors)
                .Where(f => f is not null)
                .ToList();

            if (failures.Count > 0)
            {
                // Grupisemo po imenu polja: klijent dobija sve greske odjednom,
                // umesto da ih otkriva jednu po jednu.
                var errors = failures
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(f => f.ErrorMessage).Distinct().ToArray());

                throw new ValidationException(errors);
            }

            return await next(cancellationToken);
        }
    }
}
