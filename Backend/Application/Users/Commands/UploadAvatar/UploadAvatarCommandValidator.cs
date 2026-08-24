using Application.Common;
using FluentValidation;

namespace Application.Users.Commands.UploadAvatar
{
    public class UploadAvatarCommandValidator : AbstractValidator<UploadAvatarCommand>
    {
        public UploadAvatarCommandValidator()
        {
            RuleFor(x => x.File.Content)
                .NotEmpty().WithMessage("Fajl je prazan.");

            RuleFor(x => x.File.Length)
                .LessThanOrEqualTo(ImageValidation.MaxBytes)
                .WithMessage("Slika može biti najviše 5 MB.");

            RuleFor(x => x.File.ContentType)
                .Must(ImageValidation.IsAllowedContentType)
                .WithMessage("Dozvoljene su samo slike: JPG, PNG, GIF, WEBP.");

            // Ista pravila kao kod slike u poruci: sadrzaj mora da odgovara
            // prijavljenom tipu, jer Content-Type postavlja klijent.
            RuleFor(x => x.File)
                .Must(f => ImageValidation.IsAllowedContentType(f.ContentType) &&
                           ImageValidation.HasValidSignature(f.Content, f.ContentType))
                .WithMessage("Fajl nije ispravna slika.")
                .When(f => f.File.Content.Length > 0);
        }
    }
}
