using FluentValidation;

namespace Application.Users.Commands.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Korisničko ime je obavezno.")
                .MinimumLength(3).WithMessage("Korisničko ime mora imati bar 3 karaktera.")
                // 50 nije proizvoljno - toliko je HasMaxLength(50) u AppDbContext-u.
                // Bez ovoga bi duze ime pucalo tek na bazi, kao 500 umesto 400.
                .MaximumLength(50).WithMessage("Korisničko ime može imati najviše 50 karaktera.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email je obavezan.")
                .EmailAddress().WithMessage("Email nije u ispravnom formatu.")
                .MaximumLength(100).WithMessage("Email može imati najviše 100 karaktera.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Lozinka je obavezna.")
                .MinimumLength(8).WithMessage("Lozinka mora imati bar 8 karaktera.")
                .MaximumLength(128).WithMessage("Lozinka je predugačka.")
                .Matches("[A-Za-z]").WithMessage("Lozinka mora sadržati bar jedno slovo.")
                .Matches("[0-9]").WithMessage("Lozinka mora sadržati bar jedan broj.");
        }
    }
}
