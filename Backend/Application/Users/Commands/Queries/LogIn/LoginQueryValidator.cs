using FluentValidation;

namespace Application.Users.Commands.Queries.LogIn
{
    public class LoginQueryValidator : AbstractValidator<LoginQuery>
    {
        public LoginQueryValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email je obavezan.")
                .EmailAddress().WithMessage("Email nije u ispravnom formatu.");

            // NAMERNO bez pravila o duzini i sadrzaju lozinke. Na prijavi se ne
            // proverava jacina - nalozi napravljeni pre uvodjenja pravila i
            // dalje moraju moci da se uloguju. Osim toga, detaljna poruka o
            // formatu lozinke na login formi je i mali trag za napadaca.
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Lozinka je obavezna.");
        }
    }
}
